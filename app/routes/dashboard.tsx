import { Outlet, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppSidebar } from "~/components/layout/app-sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto lg:pl-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
