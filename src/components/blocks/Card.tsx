import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type Asset = { filename?: string } | string;

type CardBlok = SbBlokData & {
  // Card wrapper
  class?: string;
  style?: string;
  // Image part
  image?: Asset;
  imageAlt?: string;
  imageClass?: string;
  imageStyle?: string;
  // Text part
  text?: string;
  textClass?: string;
  textStyle?: string;
  // Button part (renders buttonImage when set, otherwise buttonText)
  buttonText?: string;
  buttonLink?: string | { cached_url?: string; url?: string };
  buttonImage?: Asset;
  buttonClass?: string;
  buttonStyle?: string;
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

export default function Card({ blok }: { blok: CardBlok }) {
  const imageUrl = assetUrl(blok.image);
  const buttonImageUrl = assetUrl(blok.buttonImage);
  const hasText = Boolean(blok.text);
  const hasButton = Boolean(buttonImageUrl || blok.buttonText);
  // buttonLink accepts a plain string or a Storyblok link field object
  const href =
    (typeof blok.buttonLink === "string"
      ? blok.buttonLink
      : blok.buttonLink?.cached_url || blok.buttonLink?.url || "") || "#";

  return (
    <div
      {...storyblokEditable(blok)}
      className={`card-item ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={blok.imageAlt || "Image"}
          className={`card-item-img ${blok.imageClass || ""}`}
          style={parseStyle(blok.imageStyle)}
        />
      )}

      {(hasText || hasButton) && (
        <div className="card-item-row">
          {hasText && (
            <div
              className={`card-item-text ${blok.textClass || ""}`}
              style={parseStyle(blok.textStyle)}
              dangerouslySetInnerHTML={{ __html: blok.text || "" }}
            />
          )}
          {hasButton && (
            <a
              href={href}
              className={`card-item-btn ${blok.buttonClass || ""}`}
              style={parseStyle(blok.buttonStyle)}
            >
              {buttonImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={buttonImageUrl} alt="" />
              ) : (
                blok.buttonText
              )}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
