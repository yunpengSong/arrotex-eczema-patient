import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

type TeaserBlok = SbBlokData & { headline?: string };

const Teaser = ({ blok }: { blok: TeaserBlok }) => {
  return (
    <div className="teaser" {...storyblokEditable(blok)}>
      <h1>{blok.headline}</h1>
    </div>
  );
};

export default Teaser;
