import type { SbBlokData } from "@storyblok/react/rsc";

// The "popup" content type only holds global config fields consumed by the
// layout (HCP leaving-site popup); it has no visual output of its own.
export default function Popup({ blok }: { blok: SbBlokData }) {
  return null;
}
