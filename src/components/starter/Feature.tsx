import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

type FeatureBlok = SbBlokData & { name?: string };

const Feature = ({ blok }: { blok: FeatureBlok }) => {
  return (
    <div className="feature" {...storyblokEditable(blok)}>
      <span>{blok.name}</span>
    </div>
  );
};

export default Feature;
