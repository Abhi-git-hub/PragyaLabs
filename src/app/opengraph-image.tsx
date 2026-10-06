import { ImageResponse } from "next/og";

/** Root social card: midnight field, ice type, signal accent. */
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
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#737B78" }}>PRAGYA LABS</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Complex systems, made useful.
        </div>
        <div style={{ display: "flex", marginTop: 32 }}>
          <div style={{ width: 220, height: 6, background: "#3DFFA2" }} />
        </div>
        <div style={{ fontSize: 24, marginTop: 24, color: "#B3B8B3" }}>
          Grounded intelligence for real work.
        </div>
      </div>
    ),
    { ...size }
  );
}
