import {
  storyblokEditable,
  StoryblokServerComponent,
  type SbBlokData,
} from "@storyblok/react/rsc";

type GridBlok = SbBlokData & { columns?: SbBlokData[] };

const Grid = ({ blok }: { blok: GridBlok }) => (
  <div {...storyblokEditable(blok)} className="grid">
    {blok.columns?.map((nestedBlok) => (
      <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
    ))}
  </div>
);

export default Grid;
