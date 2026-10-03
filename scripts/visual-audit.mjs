import { spawn } from "node:child_process";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseUrl = "http://127.0.0.1:4173";
const outputDir = join(tmpdir(), "liftie-visual-audit");
const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const sleep = (duration) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, duration));

async function availablePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not reserve a debugging port."));
        return;
      }
      server.close(() => resolvePromise(address.port));
    });
  });
}

async function waitForUrl(url, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The server may still be starting.
    }
    await sleep(160);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpConnection {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }

  async open() {
    await new Promise((resolvePromise, reject) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const listeners = this.events.get(message.method) || [];
      listeners.forEach((listener) => listener(message.params));
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.events.get(method) || [];
    listeners.push(listener);
    this.events.set(method, listeners);
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(cdp, expression, awaitPromise = false) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
  }
  return result.result?.value;
}

async function waitForExpression(cdp, expression, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      if (await evaluate(cdp, expression)) return;
    } catch {
      // Navigation can briefly replace the execution context.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for browser expression: ${expression}`);
}

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
    screenWidth: width,
    screenHeight: height,
  });
}

async function screenshot(cdp, filename, fullPage = false) {
  let clip;
  if (fullPage) {
    const metrics = await cdp.send("Page.getLayoutMetrics");
    clip = {
      x: 0,
      y: 0,
      width: metrics.cssContentSize.width,
      height: Math.min(metrics.cssContentSize.height, 30000),
      scale: 1,
    };
  }
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: fullPage,
    ...(clip ? { clip } : {}),
  });
  const path = join(outputDir, filename);
  await writeFile(path, Buffer.from(result.data, "base64"));
  return path;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  let server;
  try {
    const current = await fetch(baseUrl);
    if (!current.ok) throw new Error("Server unavailable");
  } catch {
    server = spawn(
      process.execPath,
      [
        join(root, "node_modules", "vite", "bin", "vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "4173",
      ],
      { cwd: root, stdio: "ignore", windowsHide: true },
    );
  }
  let chrome;
  let cdp;
  let profileDir;

  try {
    await waitForUrl(baseUrl);
    const debuggingPort = await availablePort();
    profileDir = join(tmpdir(), `liftie-chrome-${Date.now()}`);
    chrome = spawn(
      chromePath,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--remote-debugging-port=${debuggingPort}`,
        `--user-data-dir=${profileDir}`,
        "about:blank",
      ],
      { stdio: "ignore", windowsHide: true },
    );

    await waitForUrl(`http://127.0.0.1:${debuggingPort}/json/version`);
    const targetResponse = await fetch(
      `http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent(baseUrl)}`,
      { method: "PUT" },
    );
    const target = await targetResponse.json();
    cdp = new CdpConnection(target.webSocketDebuggerUrl);
    await cdp.open();

    const browserErrors = [];
    cdp.on("Runtime.exceptionThrown", (params) => {
      browserErrors.push(params.exceptionDetails?.text || "Uncaught browser exception");
    });
    cdp.on("Log.entryAdded", (params) => {
      if (params.entry?.level === "error") browserErrors.push(params.entry.text);
    });

    await Promise.all([
      cdp.send("Page.enable"),
      cdp.send("Runtime.enable"),
      cdp.send("Log.enable"),
    ]);

    await setViewport(cdp, 390, 844);
    await cdp.send("Page.navigate", { url: baseUrl });
    await waitForExpression(cdp, `Boolean(document.querySelector("h1"))`);
    await sleep(300);
    await evaluate(cdp, "document.fonts.ready.then(() => true)", true);

    const mobileMetrics = await evaluate(
      cdp,
      `(() => ({
        viewport: [innerWidth, innerHeight],
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        h1Count: document.querySelectorAll("h1").length,
        buttons: document.querySelectorAll("button").length,
        deadLinks: [...document.querySelectorAll("a")].filter((link) => !link.getAttribute("href") || link.getAttribute("href") === "#").length
      }))()`,
    );

    const mobileHero = await screenshot(cdp, "mobile-390-hero.png");
    const mobileFull = await screenshot(cdp, "mobile-390-full.png", true);

    await evaluate(
      cdp,
      `(() => {
        document.documentElement.style.scrollBehavior = "auto";
        document.querySelector(".phone-stage")?.scrollIntoView();
        return true;
      })()`,
    );
    await sleep(120);
    const mobileProductTour = await screenshot(
      cdp,
      "mobile-390-product-tour.png",
    );
    const productTourInitial = await evaluate(
      cdp,
      `(() => {
        const image = document.querySelector(".phone-screen-image");
        const screen = document.querySelector(".phone-screen")?.getBoundingClientRect();
        return {
          imageCount: document.querySelectorAll(".phone-screen-image").length,
          imageLoaded: Boolean(image?.complete && image?.naturalWidth),
          imageSource: image?.getAttribute("src"),
          selectorCount: document.querySelectorAll(".preview-tabs button").length,
          selectedCount: document.querySelectorAll('.preview-tabs [aria-current="step"]').length,
          counter: document.querySelector(".preview-counter")?.textContent.trim(),
          fakeStatusRemoved: !document.querySelector(".phone-status, .phone-hardware"),
          screenRatio: screen ? Number((screen.width / screen.height).toFixed(3)) : null
        };
      })()`,
    );

    await evaluate(
      cdp,
      `document.querySelectorAll(".preview-tabs button")[2]?.click(); true`,
    );
    await waitForExpression(
      cdp,
      `document.querySelector(".phone-screen-image")?.complete === true`,
    );
    const selectorTourState = await evaluate(
      cdp,
      `(() => ({
        counter: document.querySelector(".preview-counter")?.textContent.trim(),
        source: document.querySelector(".phone-screen-image")?.getAttribute("src"),
        title: document.querySelector("#preview-screen-title")?.textContent.trim()
      }))()`,
    );
    await evaluate(cdp, `document.querySelector(".product-preview")?.focus(); true`);
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "ArrowRight",
      code: "ArrowRight",
    });
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "ArrowRight",
      code: "ArrowRight",
    });
    await sleep(80);
    const keyboardTourCounter = await evaluate(
      cdp,
      `document.querySelector(".preview-counter")?.textContent.trim()`,
    );

    await cdp.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    const phoneTouchPoints = await evaluate(
      cdp,
      `(() => {
        const rect = document.querySelector(".phone-screen")?.getBoundingClientRect();
        return rect ? {
          startX: Math.round(rect.right - 24),
          endX: Math.round(rect.left + 24),
          y: Math.round(rect.top + rect.height / 2)
        } : null;
      })()`,
    );
    if (phoneTouchPoints) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          {
            x: phoneTouchPoints.startX,
            y: phoneTouchPoints.y,
          },
        ],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: phoneTouchPoints.endX,
            y: phoneTouchPoints.y,
          },
        ],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    }
    await sleep(80);
    const swipeTourCounter = await evaluate(
      cdp,
      `document.querySelector(".preview-counter")?.textContent.trim()`,
    );

    await evaluate(
      cdp,
      `document.querySelectorAll(".preview-controls button")[0]?.click(); true`,
    );
    await sleep(60);
    const previousTourCounter = await evaluate(
      cdp,
      `document.querySelector(".preview-counter")?.textContent.trim()`,
    );
    await evaluate(
      cdp,
      `document.querySelectorAll(".preview-controls button")[1]?.click(); true`,
    );
    await sleep(60);
    const nextTourCounter = await evaluate(
      cdp,
      `document.querySelector(".preview-counter")?.textContent.trim()`,
    );

    const appScreenChecks = [];
    for (let index = 0; index < 8; index += 1) {
      await evaluate(
        cdp,
        `document.querySelectorAll(".preview-tabs button")[${index}]?.click(); true`,
      );
      await waitForExpression(
        cdp,
        `document.querySelector(".phone-screen-image")?.complete === true`,
      );
      appScreenChecks.push(
        await evaluate(
          cdp,
          `(() => {
            const image = document.querySelector(".phone-screen-image");
            return {
              index: ${index + 1},
              source: image?.getAttribute("src"),
              loaded: Boolean(image?.naturalWidth && image?.naturalHeight),
              width: image?.naturalWidth,
              height: image?.naturalHeight
            };
          })()`,
        ),
      );
    }

    await evaluate(
      cdp,
      `document.querySelector(".menu-button")?.click(); true`,
    );
    await sleep(260);
    const mobileMenuState = await evaluate(
      cdp,
      `(() => ({
        open: Boolean(document.querySelector("#mobile-navigation")),
        visibleLinks: [...document.querySelectorAll("#mobile-navigation a")].filter((link) => link.getBoundingClientRect().height > 0).length,
        bodyLocked: document.body.style.overflow === "hidden",
        activeElement: document.activeElement?.textContent.trim()
      }))()`,
    );
    const mobileMenu = await screenshot(cdp, "mobile-390-menu.png");
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
    });
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
    });
    await sleep(260);
    const menuCloseState = await evaluate(
      cdp,
      `(() => ({
        closed: !document.querySelector("#mobile-navigation"),
        bodyUnlocked: document.body.style.overflow !== "hidden",
        focusRestored: document.activeElement?.classList.contains("menu-button")
      }))()`,
    );

    await evaluate(
      cdp,
      `document.querySelector(".hero-actions button")?.click(); true`,
    );
    await sleep(180);
    const modalState = await evaluate(
      cdp,
      `(() => ({
        open: Boolean(document.querySelector('[role="dialog"]')),
        activeElement: document.activeElement?.getAttribute("aria-label") || document.activeElement?.name || document.activeElement?.tagName,
        bodyLocked: document.body.style.overflow === "hidden"
      }))()`,
    );
    const mobileModal = await screenshot(cdp, "mobile-390-modal.png");
    await evaluate(
      cdp,
      `document.querySelector('.join-form button[type="submit"]')?.click(); true`,
    );
    await sleep(80);
    const validationErrorCount = await evaluate(
      cdp,
      `document.querySelectorAll(".join-form .field-error").length`,
    );
    await evaluate(
      cdp,
      `(() => {
        const update = (selector, value) => {
          const element = document.querySelector(selector);
          if (!element) return;
          const prototype = element instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        };
        update('.join-form [name="fullName"]', "Audit Commuter");
        update('.join-form [name="email"]', "audit@organisation.co.za");
        update('.join-form [name="organisation"]', "Audit Organisation");
        update('.join-form [name="organisationType"]', "Employer");
        update('.join-form [name="city"]', "Johannesburg");
        update('.join-form [name="startArea"]', "Midrand");
        update('.join-form [name="destinationArea"]', "Sandton");
        document.querySelector('.join-form [name="termsAccepted"]')?.click();
        return true;
      })()`,
    );
    await sleep(120);
    const populatedFormState = await evaluate(
      cdp,
      `(() => ({
        fullName: document.querySelector('.join-form [name="fullName"]')?.value,
        email: document.querySelector('.join-form [name="email"]')?.value,
        organisation: document.querySelector('.join-form [name="organisation"]')?.value,
        organisationType: document.querySelector('.join-form [name="organisationType"]')?.value,
        city: document.querySelector('.join-form [name="city"]')?.value,
        startArea: document.querySelector('.join-form [name="startArea"]')?.value,
        destinationArea: document.querySelector('.join-form [name="destinationArea"]')?.value,
        termsAccepted: document.querySelector('.join-form [name="termsAccepted"]')?.checked
      }))()`,
    );
    await evaluate(
      cdp,
      `document.querySelector('.join-form button[type="submit"]')?.click(); true`,
    );
    await sleep(350);
    const missingEndpointMessage = await evaluate(
      cdp,
      `document.querySelector(".join-form .submission-message")?.textContent.replace(/\\s+/g, " ").trim()`,
    );
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
    });
    await cdp.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
    });

    await setViewport(cdp, 1440, 1000);
    await cdp.send("Page.navigate", { url: baseUrl });
    await waitForExpression(cdp, `Boolean(document.querySelector("h1"))`);
    await sleep(1200);
    await evaluate(cdp, "document.fonts.ready.then(() => true)", true);
    await evaluate(
      cdp,
      `document.documentElement.style.scrollBehavior = "auto"; true`,
    );
    const desktopMetrics = await evaluate(
      cdp,
      `(() => ({
        viewport: [innerWidth, innerHeight],
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        headingCount: document.querySelectorAll("h1, h2, h3").length,
        interactiveCount: document.querySelectorAll("a, button, input, select, textarea").length
      }))()`,
    );
    const desktopHero = await screenshot(cdp, "desktop-1440-hero.png");
    const heroBackground = await evaluate(
      cdp,
      `(() => {
        const photo = document.querySelector(".commuter-window img");
        return {
          imageLoaded: Boolean(photo?.complete && photo?.naturalWidth),
          source: photo?.getAttribute("src"),
          codeNativeArch: Boolean(document.querySelector(".road-arch path")),
          heroPhoneLoaded: Boolean(document.querySelector(".hero-phone-wrap img")?.naturalWidth),
          copy: document.querySelector("h1")?.textContent,
          noRasterReference: ![...document.images].some(image => /green commute route|green arch|mobile commuter journey/.test(image.src))
        };
      })()`,
    );

    await evaluate(
      cdp,
      `document.querySelector(".phone-stage")?.scrollIntoView(); true`,
    );
    await sleep(80);
    const desktopProductTour = await screenshot(
      cdp,
      "desktop-1440-product-tour.png",
    );

    await evaluate(
      cdp,
      `document.querySelector("#pricing")?.scrollIntoView(); true`,
    );
    await sleep(40);
    const desktopPricing = await screenshot(cdp, "desktop-1440-pricing.png");

    const calculatorChecks = await evaluate(
      cdp,
      `(() => {
        const defaultValue = document.querySelector(".monthly-result strong")?.textContent.trim();
        const driverButton = [...document.querySelectorAll(".mode-picker button")].find((button) => button.textContent.includes("Driver"));
        driverButton?.click();
        return { defaultValue, driverControlFound: Boolean(driverButton) };
      })()`,
    );
    await sleep(80);
    calculatorChecks.driverValue = await evaluate(
      cdp,
      `document.querySelector(".monthly-result strong")?.textContent.trim()`,
    );

    const routeChecks = await evaluate(
      cdp,
      `(() => {
        const buttons = document.querySelectorAll(".route-selector button");
        buttons[2]?.click();
        return buttons.length;
      })()`,
    );
    await sleep(80);
    const selectedRoute = await evaluate(
      cdp,
      `(() => ({
        distance: document.querySelector(".example-metrics > div strong")?.textContent.trim(),
        points: document.querySelector(".example-metrics > div:nth-child(2) strong")?.textContent.trim()
      }))()`,
    );

    const preferenceCheck = await evaluate(
      cdp,
      `(() => {
        document.querySelector(".toggle-control input")?.click();
        return true;
      })()`,
    );
    await sleep(80);
    const preferenceSummary = await evaluate(
      cdp,
      `document.querySelector(".result-copy strong")?.textContent.trim()`,
    );

    await evaluate(
      cdp,
      `document.querySelector("#organisations")?.scrollIntoView(); true`,
    );
    await sleep(40);
    const desktopOrganisations = await screenshot(
      cdp,
      "desktop-1440-organisations.png",
    );

    await evaluate(cdp, `document.querySelector("#faq")?.scrollIntoView(); true`);
    await sleep(40);
    const desktopFaq = await screenshot(cdp, "desktop-1440-faq.png");
    await evaluate(
      cdp,
      `(() => {
        const second = document.querySelectorAll(".accordion-item button")[1];
        second?.click();
        return true;
      })()`,
    );
    await sleep(80);
    const faqCheck = await evaluate(
      cdp,
      `document.querySelectorAll(".accordion-item button")[1]?.getAttribute("aria-expanded")`,
    );

    const responsiveWidths = [];
    for (const width of [320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920]) {
      await setViewport(cdp, width, width < 700 ? 844 : 900);
      await evaluate(cdp, "window.scrollTo(0, 0); true");
      await sleep(40);
      responsiveWidths.push(
        await evaluate(
          cdp,
          `(() => ({
            width: ${width},
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
          }))()`,
        ),
      );
    }

    const accessibilityReferences = await evaluate(
      cdp,
      `(() => {
        const missingLabelledBy = [...document.querySelectorAll("[aria-labelledby]")]
          .flatMap((element) => element.getAttribute("aria-labelledby").split(/\\s+/))
          .filter((id) => id && !document.getElementById(id));
        const missingControls = [...document.querySelectorAll("[aria-controls]")]
          .filter((element) =>
            (element.hasAttribute("aria-expanded") ? element.getAttribute("aria-expanded") === "true" : true) &&
            (element.hasAttribute("aria-selected") ? element.getAttribute("aria-selected") === "true" : true)
          )
          .flatMap((element) => element.getAttribute("aria-controls").split(/\\s+/))
          .filter((id) => id && !document.getElementById(id));
        const unnamedButtons = [...document.querySelectorAll("button")]
          .filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label"));
        return {
          missingLabelledBy: [...new Set(missingLabelledBy)],
          missingControls: [...new Set(missingControls)],
          unnamedButtonCount: unnamedButtons.length
        };
      })()`,
    );

    const extendedChecks = {};
    extendedChecks.anchorTargets = await evaluate(cdp, `(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(href => !document.getElementById(href.slice(1))))()`);
    await setViewport(cdp, 1440, 1000);
    await evaluate(cdp, `window.scrollTo(0,0); document.querySelector('.header-actions .sign-in')?.click(); true`);
    await sleep(250);
    extendedChecks.signIn = await evaluate(cdp, `Boolean(document.querySelector('[role="dialog"] .account-access'))`);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await sleep(250);
    await waitForExpression(cdp, `!document.querySelector('[role="dialog"]')`);
    extendedChecks.signInCleanup = await evaluate(cdp, `document.body.style.overflow !== 'hidden'`);
    await setViewport(cdp, 390, 844);
    await evaluate(cdp, `document.querySelector('.menu-button')?.click(); true`);
    await sleep(250);
    await evaluate(cdp, `document.querySelector('#mobile-navigation a[href="#riders"]')?.click(); true`);
    await sleep(250);
    extendedChecks.menuSelection = await evaluate(cdp, `!document.querySelector('#mobile-navigation') && document.body.style.overflow !== 'hidden' && location.hash === '#riders'`);
    await evaluate(cdp, `document.querySelector('.menu-button')?.click(); true`);
    await sleep(250);
    await setViewport(cdp, 1280, 900);
    await sleep(250);
    extendedChecks.menuResizeCleanup = await evaluate(cdp, `!document.querySelector('#mobile-navigation') && document.body.style.overflow !== 'hidden'`);
    await evaluate(cdp, `document.querySelector('.whitelist-form button[type="submit"]')?.click(); true`);
    await sleep(100);
    extendedChecks.whitelistValidationErrors = await evaluate(cdp, `document.querySelectorAll('.whitelist-form .field-error').length`);
    await evaluate(cdp, `(() => {
      const update = (name, value) => {
        const element = document.querySelector('.whitelist-form [name="' + name + '"]');
        const proto = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, value);
        element.dispatchEvent(new Event('input', {bubbles:true}));
        element.dispatchEvent(new Event('change', {bubbles:true}));
      };
      Object.entries({organisationName:'Audit Organisation',organisationType:'Company or employer',domain:'organisation.co.za',fullName:'Audit Commuter',workEmail:'audit@organisation.co.za',role:'Operations',commuters:'Fewer than 100',city:'Johannesburg'}).forEach(([name,value]) => update(name,value));
      document.querySelector('.whitelist-form [name="consent"]')?.click();
      return true;
    })()`);
    await sleep(100);
    await evaluate(cdp, `document.querySelector('.whitelist-form button[type="submit"]')?.click(); true`);
    await sleep(200);
    extendedChecks.whitelistSubmission = await evaluate(cdp, `document.querySelector('.whitelist-form .submission-message')?.textContent.trim()`);
    const sectionScreenshots = {};
    extendedChecks.sectionImages = [];
    for (const selector of ['.reality-section','#riders','#drivers','#safety','.wallet-section','.site-footer']) {
      await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView(); true`);
      await sleep(600);
      await evaluate(cdp, `Promise.all([...document.querySelectorAll(${JSON.stringify(selector + ' img')})].map(img => img.decode().catch(() => {}))).then(() => true)`, true);
      extendedChecks.sectionImages.push(await evaluate(cdp, `([...document.querySelectorAll(${JSON.stringify(selector + ' img')})].map(img => ({src:img.getAttribute('src'),loaded:img.complete && img.naturalWidth > 0,loading:img.loading})))`));
      sectionScreenshots[selector] = await screenshot(cdp, 'desktop-' + selector.replace(/[^a-z]/g,'') + '.png');
    }
    const landscape = [];
    for (const [width,height] of [[667,375],[844,390]]) {
      await setViewport(cdp,width,height);
      await evaluate(cdp, 'window.scrollTo(0,0); true');
      await sleep(100);
      landscape.push(await evaluate(cdp, `({width:${width},height:${height},overflow:document.documentElement.scrollWidth > innerWidth})`));
      await screenshot(cdp, 'landscape-' + width + '.png');
    }
    extendedChecks.landscape = landscape;
    await cdp.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    extendedChecks.reducedMotion = await evaluate(cdp, `({enabled:matchMedia('(prefers-reduced-motion: reduce)').matches,routeAnimation:getComputedStyle(document.querySelector('.commute-route path')).animationName})`);
    await cdp.send('Emulation.setEmulatedMedia', {features:[]});
    await setViewport(cdp,390,844);
    await evaluate(cdp, `window.scrollTo(0, document.querySelector('.commute-scene').getBoundingClientRect().top + scrollY - 90); true`);
    await sleep(1200);
    sectionScreenshots.mobileScene = await screenshot(cdp, 'mobile-390-scene.png');
    await setViewport(cdp,768,1024);
    await evaluate(cdp, 'window.scrollTo(0,0); true');
    await sleep(500);
    sectionScreenshots.tabletHero = await screenshot(cdp, 'tablet-768-hero.png');
    extendedChecks.sectionScreenshots = sectionScreenshots;
    const failures = [];
    if (browserErrors.length) failures.push('Browser console errors');
    if (responsiveWidths.some(item => item.overflow) || extendedChecks.landscape.some(item => item.overflow)) failures.push('Responsive overflow');
    if (mobileMetrics.deadLinks || extendedChecks.anchorTargets.length) failures.push('Missing link destinations');
    if (accessibilityReferences.missingLabelledBy.length || accessibilityReferences.missingControls.length || accessibilityReferences.unnamedButtonCount) failures.push('Accessibility references');
    if (!extendedChecks.signIn || !extendedChecks.signInCleanup || !extendedChecks.menuSelection || !extendedChecks.menuResizeCleanup) failures.push('Navigation cleanup');
    if (!menuCloseState.closed || !menuCloseState.bodyUnlocked || !menuCloseState.focusRestored) failures.push('Menu keyboard cleanup');
    if (!modalState.open || validationErrorCount === 0 || extendedChecks.whitelistValidationErrors === 0) failures.push('Form validation');
    if (extendedChecks.sectionImages.flat().some(img => !img.loaded) || appScreenChecks.some(img => !img.loaded)) failures.push('Product images failed to load');
    if (extendedChecks.reducedMotion.routeAnimation !== 'none') failures.push('Reduced motion');
    if (!heroBackground.codeNativeArch || !heroBackground.imageLoaded || !heroBackground.heroPhoneLoaded) failures.push('Hero assets');
    const result = {
      passed: failures.length === 0,
      failures,
      extendedChecks,
      mobileMetrics,
      desktopMetrics,
      modalState,
      formChecks: {
        validationErrorCount,
        populatedFormState,
        missingEndpointMessage,
      },
      mobileMenuState,
      menuCloseState,
      responsiveWidths,
      accessibilityReferences,
      functionalChecks: {
        heroBackground,
        productTourInitial,
        selectorTourState,
        keyboardTourCounter,
        swipeTourCounter,
        previousTourCounter,
        nextTourCounter,
        appScreenChecks,
        calculatorChecks,
        routeChecks,
        selectedRoute,
        preferenceCheck,
        preferenceSummary,
        faqCheck,
      },
      browserErrors,
      screenshots: {
        mobileHero,
        mobileFull,
        mobileProductTour,
        mobileMenu,
        mobileModal,
        desktopHero,
        desktopProductTour,
        desktopPricing,
        desktopOrganisations,
        desktopFaq,
      },
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (failures.length) process.exitCode = 1;
  } finally {
    cdp?.close();
    chrome?.kill();
    server?.kill();
    if (profileDir) {
      await rm(profileDir, { force: true, recursive: true }).catch(() => {});
    }
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
