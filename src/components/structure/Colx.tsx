import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type ColxBlok = SbBlokData & {
  class?: string;
  colnum?: number;
  content?: SbBlokData[];
  style?: string;
};

export default function Colx({ blok }: { blok: ColxBlok }) {
  return (
    <div {...storyblokEditable(blok)} className={`${blok.class} col-lg-${blok.colnum}`} style={parseStyle(blok.style)}>
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
