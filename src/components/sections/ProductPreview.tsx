import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { PhoneMockup } from "../product/PhoneMockup";
import { SectionHeading } from "../ui/SectionHeading";

import { appScreens as screens } from "../../data/appScreens";

const screenNumber = (index: number) => String(index + 1).padStart(2, "0");
const screenTotal = String(screens.length).padStart(2, "0");

export function ProductPreview() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const current = screens[active];

  const changeBy = useCallback((step: -1 | 1) => {
    setDirection(step === 1 ? "next" : "previous");
    setActive((index) => (index + step + screens.length) % screens.length);
  }, []);

  const selectScreen = (index: number) => {
    if (index === active) return;
    setDirection(index > active ? "next" : "previous");
    setActive(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    changeBy(event.key === "ArrowRight" ? 1 : -1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    changeBy(deltaX < 0 ? 1 : -1);
  };

  const preloadNextScreen = () => {
    const next = screens[(active + 1) % screens.length];
    const image = new Image();
    image.src = next.image;
  };

  return (
    <section
      className="section product-preview-section"
      aria-labelledby="preview-heading"
    >
      <div className="container">
        <SectionHeading
          id="preview-heading"
          eyebrow="Inside the Liftie app"
          title="See the real Liftie experience."
          body={
            <p>
              Explore the core rider, driver, group, wallet, and profile flows in
              the Liftie mobile app.
            </p>
          }
        />

        <div
          className="product-preview"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Liftie app screen tour. Use the left and right arrow keys to change screens."
        >
          <div className="phone-stage">
            <PhoneMockup
              alt={current.alt}
              direction={direction}
              label={current.title}
              onImageLoad={preloadNextScreen}
              onTouchEnd={handleTouchEnd}
              onTouchStart={handleTouchStart}
              priority={active === 0}
              src={current.image}
            />
          </div>

          <div className="preview-copy">
            <div className="preview-description">
              <span className="preview-counter mono">
                SCREEN {screenNumber(active)} / {screenTotal}
              </span>
              <h3 id="preview-screen-title">{current.title}</h3>
              <p>{current.description}</p>
            </div>

            <div className="preview-controls" aria-label="Screen controls">
              <button
                type="button"
                onClick={() => changeBy(-1)}
                aria-label="Show previous Liftie app screen"
              >
                <ArrowLeft aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => changeBy(1)}
                aria-label="Show next Liftie app screen"
              >
                <span>Next</span>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>

            <nav className="preview-tabs" aria-label="Choose an app screen">
              {screens.map((screen, index) => {
                const isActive = active === index;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Show ${screen.title}`}
                    onClick={() => selectScreen(index)}
                  >
                    <span className="preview-tab-number mono">
                      {screenNumber(index)}
                    </span>
                    <span className="preview-tab-label">{screen.label}</span>
                  </button>
                );
              })}
            </nav>

            <p className="sr-only" aria-live="polite" aria-atomic="true">
              Screen {active + 1} of {screens.length}: {current.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
