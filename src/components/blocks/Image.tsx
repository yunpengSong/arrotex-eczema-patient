"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type ImageBlok = SbBlokData & {
  class?: string;
  style?: string;
  image?: { filename?: string } | string;
  imagelink?: string;
  alt?: string;
  url?: string;
  target?: string;
};

export default function Image({ blok }: { blok: ImageBlok }) {
  const getImageUrl = () => {
    if (blok.image && typeof blok.image === "object" && blok.image.filename) {
      return blok.image.filename;
    }
    if (typeof blok.image === "string" && blok.image.trim() !== "") {
      return blok.image;
    }
    if (blok.imagelink && blok.imagelink.trim() !== "") {
      return blok.imagelink;
    }
    return "";
  };

  const getAltText = () => {
    if (blok.alt && blok.alt.trim() !== "") {
      return blok.alt;
    }
    return "Image";
  };

  const imageUrl = getImageUrl();
  const altText = getAltText();

  if (!imageUrl) {
    return (
      <div
        {...storyblokEditable(blok)}
        className={`${blok.class || ""}`}
        style={parseStyle(blok.style)}
      ></div>
    );
  }

  // Image element
  const imageElement = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={altText}
      className={`${blok.class || ""}`}
      style={parseStyle(blok.style)}
    />
  );

  // Wrap the image in an anchor when a URL is provided
  if (blok.url && blok.url.trim() !== "") {
    return (
      <a
        {...storyblokEditable(blok)}
        href={blok.url}
        target={blok.target || "_self"}
        rel={blok.target === "_blank" ? "noopener noreferrer" : undefined}
      >
        {imageElement}
      </a>
    );
  }

  // No URL; render the image directly
  return <div {...storyblokEditable(blok)}>{imageElement}</div>;
}
