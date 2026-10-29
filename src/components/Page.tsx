import {
  storyblokEditable,
  StoryblokServerComponent,
  type SbBlokData,
} from "@storyblok/react/rsc";

type PageBlok = SbBlokData & { body?: SbBlokData[] };

const Page = ({ blok }: { blok: PageBlok }) => (
  <main {...storyblokEditable(blok)}>
    {blok.body?.map((nestedBlok) => (
      <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
    ))}
  </main>
);

export default Page;
