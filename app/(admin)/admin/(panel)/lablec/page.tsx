import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import FooterEditor from "./FooterEditor";

export const metadata: Metadata = { title: "Lábléc" };

async function Content() {
  await requireAdmin();
  const [value, info] = await Promise.all([getSetting("footer"), getEditInfo("footer")]);
  return <FooterEditor initial={value} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
