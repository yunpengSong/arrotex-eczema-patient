"use client";

// Opens the global leaving-site popup rendered from the layout
export default function HcpTrigger({ label = "For HCPs" }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn btn-outline-primary btn-sm"
      onClick={() => window.dispatchEvent(new Event("open-hcp-popup"))}
    >
      {label}
    </button>
  );
}
