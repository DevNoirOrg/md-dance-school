import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import FormOptionsEditor from "./FormOptionsEditor";

export const metadata: Metadata = { title: "Űrlap opciók" };

async function Content() {
  await requireAdmin();
  const [value, info] = await Promise.all([getSetting("form_options"), getEditInfo("form_options")]);
  return <FormOptionsEditor initial={value} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
