"use client";

import { useState } from "react";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type Asset = {
  filename?: string;
  alt?: string;
  description?: string;
  name?: string;
} | string;

type FlipCardBlok = SbBlokData & {
  class?: string;
  style?: string;
  // Front face (normal state)
  frontIcon?: Asset;
  frontText?: string;
  frontStyle?: string;
  // Back face (shown after the flip)
  backIcon?: Asset;
  backText?: string;
  backStyle?: string;
};

const assetUrl = (asset?: Asset): string => {
  if (asset && typeof asset === "object" && asset.filename) {
    return asset.filename;
  }
  if (typeof asset === "string" && asset.trim() !== "") {
    return asset;
  }
  return "";
};

const assetAlt = (asset?: Asset): string => {
  if (asset && typeof asset === "object") {
    return asset.alt || asset.description || asset.name || "";
  }
  return "";
};

// One card face: round icon, caption and the flip trigger in the corner
function Face({
  icon,
  text,
  faceStyle,
  modifier,
}: {
  icon?: Asset;
  text?: string;
  faceStyle?: string;
  modifier: string;
}) {
  const url = assetUrl(icon);
  return (
    <div
      className={`flip-card-face ${modifier}`}
      style={parseStyle(faceStyle)}
    >
      {url && (
        <div className="flip-card-icon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={assetAlt(icon)} />
        </div>
      )}
      {text && (
        <div
          className="flip-card-text"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
      <span className="flip-card-trigger" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/flip-icon.svg" alt="" />
      </span>
    </div>
  );
}

// One flip card: clicking toggles between front and back face
export default function FlipCard({ blok }: { blok: FlipCardBlok }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      {...storyblokEditable(blok)}
      className={`flip-card${flipped ? " is-flipped" : ""} ${blok.class || ""}`}
      style={parseStyle(blok.style)}
      role="button"
      tabIndex={0}
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped(!flipped);
        }
      }}
    >
      <div className="flip-card-inner">
        <Face
          icon={blok.frontIcon}
          text={blok.frontText}
          faceStyle={blok.frontStyle}
          modifier="flip-card-front"
        />
        <Face
          icon={blok.backIcon}
          text={blok.backText}
          faceStyle={blok.backStyle}
          modifier="flip-card-back"
        />
      </div>
    </div>
  );
}
