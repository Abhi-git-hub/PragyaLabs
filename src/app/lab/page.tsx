import { redirect } from "next/navigation";

/**
 * /lab retired as a standalone demo gallery (Phase 3R). The LAB lives in the
 * brand and its systems now run inside the Work worlds — this route forwards
 * there. Technical systems preserved under src/components/lab/.
 */
export default function LabRedirect() {
  redirect("/work");
}
