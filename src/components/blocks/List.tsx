"use client";

import { renderRichText, storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type ListBlok = SbBlokData & {
  class?: string;
  style?: string;
  content?: string | Record<string, unknown>;
};

export default function List({ blok }: { blok: ListBlok }) {
  const getRichTextHtml = (content: string | Record<string, unknown>) => {
    const renderedContent = renderRichText(content as never);
    return renderedContent;
  };

  return (
    <>
      {blok.content && (
        <div
          {...storyblokEditable(blok)}
          className={blok.class}
          style={parseStyle(blok.style)}
          dangerouslySetInnerHTML={{ __html: getRichTextHtml(blok.content) }}
        />
      )}
    </>
  );
}
