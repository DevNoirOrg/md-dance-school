import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { readTeachers } from "@/lib/content";
import TeachersEditor from "./TeachersEditor";

export const metadata: Metadata = { title: "Tanárok" };

async function Content() {
  await requireAdmin();
  const [teachers, info] = await Promise.all([readTeachers(), getEditInfo("teachers")]);
  return <TeachersEditor initial={teachers} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
