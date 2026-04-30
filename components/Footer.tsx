import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { navItems, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">EU</span>
            <span>
              <strong>{site.name}</strong>
              <small>{site.domain}</small>
            </span>
          </div>
          <p>
            A community soccer club built around Ethiopian pride, competitive
            effort, and belonging.
          </p>
        </div>

        <div>
          <h2>Pages</h2>
          <div className="footer-links">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2>Contact</h2>
          <ul className="contact-list">
            <li>
              <Mail size={18} />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <Phone size={18} />
              <a href={`tel:${site.phone}`}>{site.phone}</a>
            </li>
            <li>
              <MapPin size={18} />
              <span>{site.location}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {site.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
