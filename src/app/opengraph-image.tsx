import { ImageResponse } from "next/og";

/** Root social card: paper field, ink type, signal accent. */
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
          background: "#F4F1EA",
          color: "#111111",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#57503F" }}>PRAGYA LABS</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Custom AI systems &amp; web applications.
        </div>
        <div style={{ display: "flex", marginTop: 32 }}>
          <div style={{ width: 220, height: 6, background: "#00C8D7" }} />
        </div>
        <div style={{ fontSize: 24, marginTop: 24, color: "#57503F" }}>
          Intelligent systems, thoughtfully built.
        </div>
      </div>
    ),
    { ...size }
  );
}
