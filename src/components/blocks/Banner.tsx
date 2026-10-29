import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type BannerBlok = SbBlokData & {
  class?: string;
  style?: string;
  bgImage?: string;
  content?: SbBlokData[];
};

export default function Banner({ blok }: { blok: BannerBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className={`banner ${blok.class || ""}`}
      style={{
        ...parseStyle(blok.style),
        backgroundImage: blok.bgImage ? `url(${blok.bgImage})` : undefined,
      }}
    >
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
