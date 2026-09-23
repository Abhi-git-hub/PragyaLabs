import { ImageResponse } from "next/og";

/** Root social card: obsidian field, brand line, signal accent. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function RootOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#050608",
          color: "#F2F1EA",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#B3B8B3" }}>PRAGYA LABS</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Digital systems engineered with intelligence.
        </div>
        <div style={{ display: "flex", marginTop: 32 }}>
          <div style={{ width: 220, height: 4, background: "#3DFFA2" }} />
        </div>
        <div style={{ fontSize: 24, marginTop: 24, color: "#B3B8B3" }}>Delhi — India / 2026</div>
      </div>
    ),
    { ...size }
  );
}
