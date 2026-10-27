import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import PricesEditor from "./PricesEditor";

export const metadata: Metadata = { title: "Árak" };

async function Content() {
  await requireAdmin();
  const [prices, info] = await Promise.all([getSetting("prices"), getEditInfo("prices")]);
  return <PricesEditor initial={prices} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
