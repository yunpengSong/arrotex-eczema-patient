import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type SectionBlok = SbBlokData & {
  class?: string;
  style?: string;
  content?: SbBlokData[];
};

export default function Section({ blok }: { blok: SectionBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className={blok.class || undefined}
      style={parseStyle(blok.style)}
    >
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </section>
  );
}
