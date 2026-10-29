import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type CardBoxBlok = SbBlokData & {
  class?: string;
  style?: string;
  content?: SbBlokData[];
};

export default function CardBox({ blok }: { blok: CardBoxBlok }) {
  return (
    <div {...storyblokEditable(blok)} className={`${blok.class}`} style={parseStyle(blok.style)}>
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
