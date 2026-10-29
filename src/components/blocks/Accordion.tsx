import {
  storyblokEditable,
  StoryblokServerComponent,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { parseStyle } from "@/utils/styleParser";

type AccordionBlok = SbBlokData & {
  title?: string;
  content?: SbBlokData[];
  defaultOpen?: boolean;
  class?: string;
  style?: string;
  titleClass?: string;
  titleStyle?: string;
};

// Collapsible section built on the native <details>/<summary> elements, so
// no client-side JS is needed. The expanded area renders nested bloks.
export default function Accordion({ blok }: { blok: AccordionBlok }) {
  return (
    <details
      {...storyblokEditable(blok)}
      className={`accordion ${blok.class || ""}`}
      style={parseStyle(blok.style)}
      open={blok.defaultOpen || undefined}
    >
      <summary className="accordion-summary">
        <span
          className={`accordion-title ${blok.titleClass || ""}`}
          style={parseStyle(blok.titleStyle)}
          dangerouslySetInnerHTML={{ __html: blok.title || "" }}
        />
        <svg
          className="accordion-chevron"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div className="accordion-content">
        {blok.content?.map((nested) => (
          <StoryblokServerComponent key={nested._uid} blok={nested} />
        ))}
      </div>
    </details>
  );
}
