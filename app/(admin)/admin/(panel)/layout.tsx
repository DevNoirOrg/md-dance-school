import { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PanelLoading from "@/components/admin/PanelLoading";
import { getAdmin } from "@/lib/auth";

/*
  Az admin panel váza. A menü statikus (azonnal megjelenik); a bejelentkezett
  admin és az oldalak tartalma a munkamenet ellenőrzése után töltődik be.
*/
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar
        account={
          <Suspense fallback={<span className="text-white/40">…</span>}>
            <AdminEmail />
          </Suspense>
        }
      />
      <main className="min-w-0 flex-1 px-4 pb-0 pt-6 md:px-10 md:pt-10">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<PanelLoading />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}

async function AdminEmail() {
  const admin = await getAdmin();
  return <span className="block truncate text-white/70">{admin?.email}</span>;
}
