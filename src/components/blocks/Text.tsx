"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type TextBlok = SbBlokData & {
  class?: string;
  style?: string;
  content?: string;
};

export default function Text({ blok }: { blok: TextBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className={`${blok.class}`}
      style={parseStyle(blok.style)}
      dangerouslySetInnerHTML={{
        __html: blok.content || "",
      }}
    />
  );
}
