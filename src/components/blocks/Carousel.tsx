import {
  storyblokEditable,
  StoryblokServerComponent,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";
import CarouselView from "./CarouselView";

type CarouselBlok = SbBlokData & {
  items?: SbBlokData[];
  class?: string;
  style?: string;
};

// Server wrapper: renders the slides as server components (so any blok
// type works inside) and hands them to the client-side carousel view.
export default function Carousel({ blok }: { blok: CarouselBlok }) {
  const slides = blok.items?.map((nested) => (
    <StoryblokServerComponent key={nested._uid} blok={nested} />
  ));

  return (
    <div
      {...storyblokEditable(blok)}
      className={`carousel ${blok.class || ""}`}
      style={parseStyle(blok.style)}
    >
      <CarouselView count={blok.items?.length || 0}>{slides}</CarouselView>
    </div>
  );
}
