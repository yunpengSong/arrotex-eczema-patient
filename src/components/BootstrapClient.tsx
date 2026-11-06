"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    // Any anchor that is itself marked .open-new-tab, or contains an
    // element with that class (e.g. the img of a linked Image blok), opens
    // in a new tab. Click delegation so it also works for content rendered
    // after mount (Storyblok visual editor, client-side navigation).
    const openInNewTab = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a");
      if (
        anchor &&
        (anchor.classList.contains("open-new-tab") ||
          anchor.querySelector(".open-new-tab"))
      ) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
    };

    // Any anchor marked .hcp-link (on the anchor or a descendant) opens
    // the leaving-site popup (HcpPopup) instead of navigating; the popup's
    // Continue button then goes to the link's URL.
    const openHcpPopup = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a");
      if (
        anchor &&
        anchor.getAttribute("href") &&
        (anchor.classList.contains("hcp-link") ||
          anchor.querySelector(".hcp-link"))
      ) {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("open-hcp-popup", {
            detail: { url: anchor.href },
          }),
        );
      }
    };

    document.addEventListener("click", openInNewTab);
    document.addEventListener("click", openHcpPopup);
    return () => {
      document.removeEventListener("click", openInNewTab);
      document.removeEventListener("click", openHcpPopup);
    };
  }, []);

  return null;
}
