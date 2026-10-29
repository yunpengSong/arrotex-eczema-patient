import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";

type RowBlok = SbBlokData & {
  class?: string;
  cols?: SbBlokData[];
};

export default function Row({ blok }: { blok: RowBlok }) {
  return (
    <div {...storyblokEditable(blok)} className={`row ${blok.class}`}>
      {blok.cols?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
