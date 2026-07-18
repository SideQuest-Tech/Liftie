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
    await sleep(400);
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
        const photo = document.querySelector(".hero-photo");
        return {
          imageLoaded: getComputedStyle(photo).backgroundImage.includes("liftie-hero-commute.jpg"),
          matchPanelRemoved: !document.querySelector(".corridor-visual"),
          coversHero: photo?.getBoundingClientRect().height === document.querySelector(".hero")?.getBoundingClientRect().height
        };
      })()`,
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
    for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
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

    const result = {
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
        mobileMenu,
        mobileModal,
        desktopHero,
        desktopPricing,
        desktopOrganisations,
        desktopFaq,
      },
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
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
