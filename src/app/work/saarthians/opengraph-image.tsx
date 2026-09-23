import { ImageResponse } from "next/og";
import { getProject } from "@/data/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Flagship OG card for /work/saarthians (TRD §10). */
export default async function Image() {
  const project = getProject("saarthians");
  const title = project?.title ?? "Saarthians";
  const category = project?.category ?? "Education Platform";
  const year = project?.year ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#060608",
          color: "#f4f3ec",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#5b606b",
          }}
        >
          <span>PRAGYA LABS</span>
          <span style={{ color: "#35e9ff" }}>{category}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -1,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#9ba0ab" }}>{year}</div>
        </div>
        <div style={{ fontSize: 20, color: "#5b606b", letterSpacing: 2, textTransform: "uppercase" }}>
          Digital systems engineered with intelligence.
        </div>
      </div>
    ),
    { ...size }
  );
}
