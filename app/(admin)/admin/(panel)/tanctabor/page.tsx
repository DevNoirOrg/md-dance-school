import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { readTeachers } from "@/lib/content";
import CampEditor from "./CampEditor";

export const metadata: Metadata = { title: "Tánctábor" };

async function Content() {
  await requireAdmin();
  const [camp, teachers, info] = await Promise.all([getSetting("camp"), readTeachers(), getEditInfo("camp")]);
  return <CampEditor initial={camp} teacherNames={teachers.map((t) => t.name)} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
