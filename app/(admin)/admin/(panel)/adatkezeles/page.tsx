import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import PrivacyEditor from "./PrivacyEditor";

export const metadata: Metadata = { title: "Adatkezelés" };

async function Content() {
  await requireAdmin();
  const [value, info] = await Promise.all([getSetting("privacy"), getEditInfo("privacy")]);
  return <PrivacyEditor initial={value.text} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
