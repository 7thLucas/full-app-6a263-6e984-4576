import { Link, useLocation, Form } from "react-router";
import {
  LayoutDashboard,
  Sprout,
  ShoppingBag,
  Truck,
  AlertTriangle,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";
import { cn } from "~/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", to: "/dashboard/inventory", icon: Sprout },
  { label: "Orders", to: "/dashboard/orders", icon: ShoppingBag },
  { label: "Deliveries", to: "/dashboard/deliveries", icon: Truck },
  { label: "Spoilage", to: "/dashboard/spoilage", icon: AlertTriangle },
];

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive =
    item.to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.to);
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-emerald-600 text-white"
          : "text-slate-300 hover:bg-slate-700 hover:text-white",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function AppSidebar() {
  const { config, loading } = useConfigurables();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const appName = loading ? "Florista" : (config?.sidebarTitle ?? config?.appName ?? "Florista");

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 lg:hidden">
        <span className="text-lg font-semibold text-emerald-400">{appName}</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-200",
          "lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-700 px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">{appName}</span>
            </Link>
          )}
          {collapsed && <Sprout className="h-6 w-6 text-emerald-400" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white lg:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-slate-700 p-3 space-y-1", collapsed && "px-2")}>
          <Link
            to="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-rose-600/20 hover:text-rose-400 transition-colors",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Sign out" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </Form>

          {!collapsed && user && (
            <div className="mt-2 rounded-lg bg-slate-800 px-3 py-2">
              <p className="truncate text-xs font-medium text-white">{user.username}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
