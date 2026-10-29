"use client";

import { useEffect, useState } from "react";

type HcpPopupProps = {
  title?: string;
  textHtml?: string;
  continueUrl?: string;
  cancelText?: string;
  continueText?: string;
};

// Global leaving-site popup. Rendered once from the root layout with
// content fetched from the Storyblok "settings" story; any element can
// open it by dispatching a window "open-hcp-popup" event.
export default function HcpPopup({
  title = "You are now leaving this site",
  textHtml = "",
  continueUrl = "#",
  cancelText = "Cancel",
  continueText = "Continue",
}: HcpPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-hcp-popup", onOpen);
    return () => window.removeEventListener("open-hcp-popup", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="hcp-popup-overlay" onClick={() => setOpen(false)}>
      <div
        className="hcp-popup"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hcp-popup-title">{title}</div>
        <div
          className="hcp-popup-text"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />
        <div className="hcp-popup-actions">
          <button
            type="button"
            className="hcp-popup-btn"
            onClick={() => setOpen(false)}
          >
            <span className="hcp-popup-btn-icon">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3 5 8l5 5" />
              </svg>
            </span>
            {cancelText}
          </button>
          <a className="hcp-popup-btn" href={continueUrl}>
            {continueText}
            <span className="hcp-popup-btn-icon">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
