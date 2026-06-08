import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Sprout,
  ShoppingBag,
  Truck,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useConfigurables } from "~/modules/configurables";
import { apiGet } from "~/lib/api.client";

interface InventorySummary {
  total: number;
  fresh: number;
  useSoon: number;
  critical: number;
  expired: number;
  totalStems: number;
}

interface OrdersSummary {
  total: number;
  pending: number;
  inProgress: number;
  ready: number;
  fulfilled: number;
}

interface DeliveriesSummary {
  total: number;
  scheduled: number;
  outForDelivery: number;
  delivered: number;
  todayCount: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  badge?: { label: string; variant: "emerald" | "amber" | "rose" | "slate" };
  to?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, bgColor, badge, to }: StatCardProps) {
  const content = (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className={`rounded-xl p-3 ${bgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {badge && (
          <div className="mt-4">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return content;
}

export default function DashboardPage() {
  const { config, loading: configLoading } = useConfigurables();
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [orders, setOrders] = useState<OrdersSummary | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveriesSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const [invRes, ordRes, delRes] = await Promise.all([
          apiGet<InventorySummary>("/api/inventory/summary"),
          apiGet<OrdersSummary>("/api/orders/summary"),
          apiGet<DeliveriesSummary>("/api/deliveries/summary"),
        ]);
        if (invRes.success && invRes.data) setInventory(invRes.data);
        if (ordRes.success && ordRes.data) setOrders(ordRes.data);
        if (delRes.success && delRes.data) setDeliveries(delRes.data);
      } catch {}
      setDataLoading(false);
    }
    fetchSummaries();
  }, []);

  const welcomeMsg = configLoading
    ? ""
    : (config?.dashboardWelcomeMessage ?? "Welcome back. Here's what needs your attention today.");

  const atRiskCount = inventory ? inventory.useSoon + inventory.critical : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">{welcomeMsg}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stems"
          value={dataLoading ? "—" : (inventory?.totalStems ?? 0)}
          subtitle={`${inventory?.total ?? 0} varieties tracked`}
          icon={Sprout}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          badge={
            atRiskCount > 0
              ? { label: `${atRiskCount} at risk`, variant: "rose" }
              : { label: "All fresh", variant: "emerald" }
          }
          to="/dashboard/inventory"
        />
        <StatCard
          title="Active Orders"
          value={dataLoading ? "—" : ((orders?.pending ?? 0) + (orders?.inProgress ?? 0))}
          subtitle={`${orders?.total ?? 0} total orders`}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          badge={
            (orders?.ready ?? 0) > 0
              ? { label: `${orders?.ready} ready`, variant: "emerald" }
              : undefined
          }
          to="/dashboard/orders"
        />
        <StatCard
          title="Today's Deliveries"
          value={dataLoading ? "—" : (deliveries?.todayCount ?? 0)}
          subtitle={`${deliveries?.scheduled ?? 0} scheduled total`}
          icon={Truck}
          iconColor="text-violet-600"
          bgColor="bg-violet-50"
          badge={
            (deliveries?.outForDelivery ?? 0) > 0
              ? { label: `${deliveries?.outForDelivery} en route`, variant: "amber" }
              : undefined
          }
          to="/dashboard/deliveries"
        />
        <StatCard
          title="Spoilage Alerts"
          value={dataLoading ? "—" : atRiskCount}
          subtitle={`${inventory?.critical ?? 0} critical, ${inventory?.useSoon ?? 0} soon`}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          bgColor="bg-rose-50"
          badge={
            atRiskCount === 0
              ? { label: "No alerts", variant: "emerald" }
              : { label: "Needs attention", variant: "rose" }
          }
          to="/dashboard/spoilage"
        />
      </div>

      {/* Quick action rows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders status */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Orders Overview</CardTitle>
            <Link
              to="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              View all123 <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pending", value: orders?.pending ?? 0, color: "bg-slate-400" },
              { label: "In Progress", value: orders?.inProgress ?? 0, color: "bg-blue-500" },
              { label: "Ready", value: orders?.ready ?? 0, color: "bg-emerald-500" },
              { label: "Fulfilled", value: orders?.fulfilled ?? 0, color: "bg-slate-300" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory freshness */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Inventory Freshness</CardTitle>
            <Link
              to="/dashboard/inventory"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Fresh", value: inventory?.fresh ?? 0, color: "bg-emerald-500" },
              { label: "Use Soon", value: inventory?.useSoon ?? 0, color: "bg-amber-500" },
              { label: "Critical", value: inventory?.critical ?? 0, color: "bg-rose-500" },
              { label: "Expired", value: inventory?.expired ?? 0, color: "bg-slate-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
