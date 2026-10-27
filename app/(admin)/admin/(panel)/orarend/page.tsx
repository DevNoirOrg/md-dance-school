import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { readRooms } from "@/lib/content";
import ScheduleEditor from "./ScheduleEditor";

export const metadata: Metadata = { title: "Órarend" };

async function Content() {
  await requireAdmin();
  const [rooms, schedule, info] = await Promise.all([readRooms(), getSetting("schedule"), getEditInfo("schedule")]);
  return <ScheduleEditor initial={rooms} initialHint={schedule.hint} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
