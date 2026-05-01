"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`${site.name} home`}>
        <span className="brand-mark">EU</span>
        <span>
          <strong>{site.name}</strong>
          <small>{site.domain}</small>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            className={pathname === item.href ? "active" : ""}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="header-cta" href="/chat">
        Team Chat
      </Link>

      <button
        className="icon-button mobile-menu-button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/chat" onClick={() => setOpen(false)}>
            Team Chat
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
