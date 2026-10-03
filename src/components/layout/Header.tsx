import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../forms/Modal";
import { navItems } from "../../data/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

type HeaderProps = {
  onJoin: () => void;
};

export function Header({ onJoin }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const closeSignIn = useCallback(() => setSignInOpen(false), []);
  const signInUrl = import.meta.env.VITE_LIFTIE_SIGN_IN_URL as string | undefined;
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const ids = useMemo(() => navItems.map((item) => item.href.slice(1)), []);
  const activeId = useScrollSpy(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      document.querySelector<HTMLElement>("#mobile-navigation a")?.focus();
    }, 220);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  const signInAction = signInUrl ? (
    <a className="button button-secondary sign-in" href={signInUrl} onClick={closeMenu}>Sign in</a>
  ) : (
    <Button variant="secondary" className="sign-in" onClick={() => { closeMenu(); setSignInOpen(true); }}>Sign in</Button>
  );

  return (
    <><header
      ref={headerRef}
      className={`site-header ${scrolled || menuOpen ? "is-scrolled" : ""}`}
    >
      <div className="header-inner">
        <a href="#top" className="logo-link" aria-label="Liftie home" onClick={closeMenu}>
          <Logo />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.slice(0, 4).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={activeId === item.href.slice(1) ? "active" : ""}
              aria-current={activeId === item.href.slice(1) ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">{signInAction}<Button className="header-cta" onClick={onJoin}>Join Liftie</Button></div>
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={reducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-nav-inner">
              {navItems.map((item, index) => (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  <span className="mono">0{index + 1}</span>
                  {item.label}
                </a>
              ))}
              {signInAction}
              <Button
                arrow
                onClick={() => {
                  closeMenu();
                  onJoin();
                }}
              >
                Join Liftie
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
    <Modal open={signInOpen} onClose={closeSignIn} title="Your next commute starts here." eyebrow="Liftie account access" closeLabel="Close sign-in information" description="Sign-in is not connected to this website yet. You can register your interest in the Liftie network below.">
      <div className="account-access"><Button arrow onClick={() => { closeSignIn(); onJoin(); }}>Join Liftie</Button></div>
    </Modal></>
  );
}
