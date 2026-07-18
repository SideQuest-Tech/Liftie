import { ArrowUpRight } from "lucide-react";
import { navItems } from "../../data/content";
import { Logo } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-route" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" aria-label="Back to the top">
            <Logo />
          </a>
          <p>
            A private, organisation-based network for recurring work and campus
            commutes.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="footer-nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="footer-future" aria-label="Future information links">
          <p className="footer-label">Information</p>
          <span>Privacy notice, coming soon</span>
          <span>Terms, coming soon</span>
          <span>Contact, coming soon</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Liftie. All rights reserved.</p>
        <p>Built for recurring South African commutes.</p>
      </div>
    </footer>
  );
}
