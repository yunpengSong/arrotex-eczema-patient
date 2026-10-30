import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type Asset = {
  filename?: string;
  alt?: string;
  description?: string;
  name?: string;
} | string;

type TableColumnBlok = SbBlokData & {
  // Column wrapper
  class?: string;
  style?: string;
  // Column heading shown in the peach header band
  title?: string;
  titleStyle?: string;
  // Circular icon
  icon?: Asset;
  iconStyle?: string;
  // Description text (HTML allowed, e.g. bold/italic)
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

// One column of the table: title, round icon and description text
export default function TableColumn({ blok }: { blok: TableColumnBlok }) {
  const iconUrl = assetUrl(blok.icon);

  return (
    <div
      {...storyblokEditable(blok)}
      className={`table-column ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {blok.title && (
        <div
          className="table-column-title"
          style={parseStyle(blok.titleStyle)}
          dangerouslySetInnerHTML={{ __html: blok.title || "" }}
        />
      )}
      {iconUrl && (
        <div className="table-column-icon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt={assetAlt(blok.icon)}
            style={parseStyle(blok.iconStyle)}
          />
        </div>
      )}
      {blok.text && (
        <div
          className="table-column-text"
          style={parseStyle(blok.textStyle)}
          dangerouslySetInnerHTML={{ __html: blok.text || "" }}
        />
      )}
    </div>
  );
}
