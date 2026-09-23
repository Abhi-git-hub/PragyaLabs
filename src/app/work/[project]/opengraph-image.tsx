import { ImageResponse } from "next/og";
import { getProject } from "@/data/projects";

/** Per-case-study social cards, generated from the project record. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ProjectOgImage({ params }: { params: { project: string } }) {
  const project = getProject(params.project);
  const title = project?.title ?? "Pragya Labs";
  const category = project?.category ?? "Case study";

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
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#3DFFA2" }}>
          {category.toUpperCase()}
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 16 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#B3B8B3" }}>Pragya Labs — case study</div>
      </div>
    ),
    { ...size }
  );
}
