import { storyblokEditable, StoryblokServerComponent, type SbBlokData } from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type TableColumnsBlok = SbBlokData & {
  columns?: SbBlokData[];
  class?: string;
  style?: string;
};

// A column table: a peach header band with one title per column, followed
// by a circular icon and description text. Children are table_column bloks.
export default function TableColumns({ blok }: { blok: TableColumnsBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className={`table-columns ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      {blok.columns?.map((nested) => (
        <StoryblokServerComponent key={nested._uid} blok={nested} />
      ))}
    </div>
  );
}
