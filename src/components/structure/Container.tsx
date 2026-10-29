import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";

type ContainerBlok = SbBlokData & {
  class?: string;
  content?: SbBlokData[];
};

export default function Container({ blok }: { blok: ContainerBlok }) {
  return (
    <div {...storyblokEditable(blok)} className={`container ${blok.class}`}>
      {blok.content?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
