"use client";

import Link from "next/link";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

export default function Footer({ blok }: { blok: SbBlokData }) {
  return (
    <footer {...storyblokEditable(blok)} className="footer bg-grey pb-4 pt-5">
      <div className="container pt-3">
        <div className="row align-items-center">
          <div className="col-12">
            <div className="footer-bottom-text">
              This website is an information resource that is only for Australian residents. This website contains general educational information about eczema and is not intended to promote any prescription medicine. Treatment decisions should be made in consultation with a healthcare professional.<br />
              <strong>For medical emergencies please dial 000 immediately.</strong><br />
              You should report side effects to the Therapeutic Goods Administration (TGA) online at www.tga.gov.au/safety/reporting-problems.
            </div>
            <div className="footer-link pt-3">
              <Link href="#">Contact us</Link>
              <Link href="#">Terms of use</Link>
              <Link href="#">Privacy policy</Link>
              <Link href="#">Cookie preferences</Link>
            </div>
            <div className="footer-bottom-text pt-3">
              PRESCRIPTION-00573. Date of preparation October 2026<br />
              Arrotex Pharmaceuticals. 15/17 Chapel St, Cremorne VIC 3121. © 2026. Ph: 1800 195 055. Email: patient.safety@arrotex.com.au
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
