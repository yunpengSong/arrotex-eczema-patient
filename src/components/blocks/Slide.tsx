import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type Asset = {
  filename?: string;
  alt?: string;
  description?: string;
  name?: string;
} | string;

type SlideBlok = SbBlokData & {
  // Card wrapper
  class?: string;
  style?: string;
  // Avatar image
  image?: Asset;
  imageAlt?: string;
  imageStyle?: string;
  // Title and quote text (HTML allowed, e.g. superscripts)
  title?: string;
  titleStyle?: string;
  text?: string;
  textStyle?: string;
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

// Fall back to the asset's own alt/description when no alt field is set
const assetAlt = (asset?: Asset): string => {
  if (asset && typeof asset === "object") {
    return asset.alt || asset.description || asset.name || "";
  }
  return "";
};

// One slide of the carousel: round avatar on the left, title + text on the
// right. Designed to be placed inside the carousel blok's items.
export default function Slide({ blok }: { blok: SlideBlok }) {
  const imageUrl = assetUrl(blok.image);

  return (
    <div
      {...storyblokEditable(blok)}
      className={`slide-card ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={blok.imageAlt || assetAlt(blok.image)}
          className="slide-card-avatar"
          style={parseStyle(blok.imageStyle)}
        />
      )}
      <div className="slide-card-body">
        {blok.title && (
          <div
            className="slide-card-title"
            style={parseStyle(blok.titleStyle)}
            dangerouslySetInnerHTML={{ __html: blok.title || "" }}
          />
        )}
        {blok.text && (
          <div
            className="slide-card-text"
            style={parseStyle(blok.textStyle)}
            dangerouslySetInnerHTML={{ __html: blok.text || "" }}
          />
        )}
      </div>
    </div>
  );
}
