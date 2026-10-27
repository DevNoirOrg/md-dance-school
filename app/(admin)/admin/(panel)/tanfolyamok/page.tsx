import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import CoursesEditor from "./CoursesEditor";

export const metadata: Metadata = { title: "Tanfolyamok" };

async function Content() {
  await requireAdmin();
  const [value, info] = await Promise.all([getSetting("courses"), getEditInfo("courses")]);
  return <CoursesEditor initial={value} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
