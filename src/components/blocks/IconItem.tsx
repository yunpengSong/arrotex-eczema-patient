import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type Asset = {
  filename?: string;
  alt?: string;
  description?: string;
  name?: string;
} | string;

type IconItemBlok = SbBlokData & {
  // Wrapper
  class?: string;
  style?: string;
  // Text part (HTML allowed, e.g. superscripts)
  text?: string;
  textClass?: string;
  textStyle?: string;
  // Icon Group: image plus its circular base
  icon?: Asset;
  iconClass?: string;
  iconStyle?: string;
  backgroundClass?: string;
  backgroundStyle?: string;
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

// Fall back to the asset's own alt/description/name when no alt field is set
const assetAlt = (asset?: Asset): string => {
  if (asset && typeof asset === "object") {
    return asset.alt || asset.description || asset.name || "";
  }
  return "";
};

// Icon + text item laid out horizontally: a circular base (background via
// backgroundStyle) with the icon image centered inside, then the text.
// Place inside row/colx columns to build a grid (e.g. col-lg-4 for three
// per row).
export default function IconItem({ blok }: { blok: IconItemBlok }) {
  const iconUrl = assetUrl(blok.icon);

  return (
    <div
      {...storyblokEditable(blok)}
      className={`icon-item ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {iconUrl && (
        <span
          className={`icon-item-circle ${blok.backgroundClass || ""}`}
          style={parseStyle(blok.backgroundStyle)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt={assetAlt(blok.icon)}
            className={`icon-item-img ${blok.iconClass || ""}`}
            style={parseStyle(blok.iconStyle)}
          />
        </span>
      )}
      {blok.text && (
        <div
          className={`icon-item-text ${blok.textClass || ""}`}
          style={parseStyle(blok.textStyle)}
          dangerouslySetInnerHTML={{ __html: blok.text || "" }}
        />
      )}
    </div>
  );
}
