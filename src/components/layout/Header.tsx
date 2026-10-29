import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import HcpTrigger from "./HcpTrigger";

type Asset = { filename?: string } | string;

type HeaderBlok = SbBlokData & {
  logo?: Asset;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  hcpLabel?: string;
  navItems?: SbBlokData[];
};

const assetUrl = (asset?: Asset): string => {
  if (asset && typeof asset === "object" && asset.filename) {
    return asset.filename;
  }
  if (typeof asset === "string" && asset.trim() !== "") {
    return asset;
  }
  return "";
};

export default function Header({ blok }: { blok: HeaderBlok }) {
  const logoSrc = assetUrl(blok.logo) || "/assets/images/logo.svg";
  const logoStyle = {
    width: `${blok.logoWidth || 220}px`,
    height: blok.logoHeight ? `${blok.logoHeight}px` : "auto",
  };

  return (
    <nav
      {...storyblokEditable(blok)}
      className="navbar navbar-expand-lg bg-body-tertiary pt-3 pb-3"
    >
      <div className="container">
        <a href="/">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image does not optimize SVGs; a plain img is fine */}
          <img src={logoSrc} alt={blok.logoAlt || "Logo"} style={logoStyle} />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse flex-wrap"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav ms-lg-auto mb-2 mb-lg-0">
            {blok.navItems?.map((nestedBlok) => (
              <StoryblokServerComponent
                blok={nestedBlok}
                key={nestedBlok._uid}
              />
            ))}
          </ul>

          <div className="w-100 d-flex justify-content-lg-end mt-3">
            <HcpTrigger label={blok.hcpLabel || "For HCPs"} />
          </div>
        </div>
      </div>
    </nav>
  );
}
