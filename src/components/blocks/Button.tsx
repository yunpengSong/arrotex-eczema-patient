"use client";

import { useState } from "react";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type ButtonBlok = SbBlokData & {
  class?: string;
  style?: string;
  text?: string;
  action?: string;
};

export default function Button({ blok }: { blok: ButtonBlok }) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle button click
  const handleClick = async () => {
    if (!blok.action || blok.action === "none") return;

    if (blok.action === "fetch-dog") {
      try {
        setLoading(true);
        const res = await fetch("https://dog.ceo/api/breeds/image/random");
        const data = await res.json();
        setImage(data.message);
      } catch (err) {
        console.error("Error fetching dog image:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <button
        {...storyblokEditable(blok)}
        type="button"
        className={blok.class}
        style={parseStyle(blok.style)}
        onClick={handleClick}
        disabled={loading}
      >
        {blok.text}
      </button>

      {image && (
        <div style={{ marginTop: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Random Dog" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </>
  );
}
