import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type TitleBlok = SbBlokData & {
  text?: string;
  class?: string;
  style?: string;
};

export default function Title({ blok }: { blok: TitleBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className={`section-title ${blok.class || ""}`}
    >
      <img src="/assets/images/title-icon.svg" alt="" />
      <span
        className="section-title-text"
        style={parseStyle(blok.style)}
        dangerouslySetInnerHTML={{ __html: blok.text || "" }}
      />
    </div>
  );
}
