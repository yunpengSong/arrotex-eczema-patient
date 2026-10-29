"use client";

import Link from "next/link";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type LinkBlok = SbBlokData & {
  class?: string;
  style?: string;
  href?: { url?: string; cached_url?: string };
  text?: string;
  target?: string;
};

export default function LinkComponent({ blok }: { blok: LinkBlok }) {
  const getHref = () => {
    if (blok.href?.url) {
      return blok.href.url;
    }
    if (blok.href?.cached_url) {
      return blok.href.cached_url;
    }
    return "";
  };

  const getText = () => {
    if (blok.text && blok.text.trim() !== "") {
      return blok.text;
    }
    return "";
  };

  const href = getHref();
  const text = getText();

  if (!href || !text) {
    return (
      <span
        {...storyblokEditable(blok)}
        className={`${blok.class || ""}`}
        style={parseStyle(blok.style)}
      />
    );
  }

  return (
    <Link
      {...storyblokEditable(blok)}
      href={href}
      target={blok.target || "_self"}
      className={`${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {text}
    </Link>
  );
}
