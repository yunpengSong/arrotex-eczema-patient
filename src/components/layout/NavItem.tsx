"use client";

import { usePathname } from "next/navigation";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

type NavItemBlok = SbBlokData & {
  label?: string;
  url?: string | { cached_url?: string; url?: string };
};

export default function NavItem({ blok }: { blok: NavItemBlok }) {
  const pathname = usePathname();
  // url accepts a plain string or a Storyblok link field object
  const raw =
    (typeof blok.url === "string"
      ? blok.url
      : blok.url?.cached_url || blok.url?.url || "") || "#";
  // Normalize internal paths to start with "/" (Storyblok cached_url omits it);
  // the homepage slug "home" maps to "/"
  const href =
    raw === "home"
      ? "/"
      : raw.startsWith("/") || raw.startsWith("http") || raw === "#"
        ? raw
        : `/${raw}`;

  // Highlight the item matching the current page; "/" only matches exactly
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <li {...storyblokEditable(blok)} className="nav-item">
      <a
        className={`nav-link${active ? " active" : ""}`}
        href={href}
        // Hidden bold copy in CSS uses this to reserve the bold width
        data-label={blok.label}
      >
        {blok.label}
      </a>
    </li>
  );
}
