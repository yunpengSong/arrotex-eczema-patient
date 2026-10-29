import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";

type ColBlok = SbBlokData & {
  class?: string;
  content?: SbBlokData[];
};

export default function Col({ blok }: { blok: ColBlok }) {
  return (
    <div {...storyblokEditable(blok)} className={`col-12 ${blok.class}`}>
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
