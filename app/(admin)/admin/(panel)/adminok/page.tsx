import { Suspense } from "react";
import PanelLoading from "@/components/admin/PanelLoading";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminsEditor from "./AdminsEditor";

export const metadata: Metadata = { title: "Adminok" };

async function AdminsPageContent() {
  const me = await requireAdmin();
  const rows = await db()<{ email: string; created_at: Date }[]>`select email, created_at from mdschool.admins order by created_at`;
  return <AdminsEditor me={me.email} admins={rows.map((r) => ({ email: r.email, createdAt: r.created_at.toISOString() }))} />;
}

export default function AdminsPage() {
  return (
    <Suspense fallback={<PanelLoading />}>
      <AdminsPageContent />
    </Suspense>
  );
}
