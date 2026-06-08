import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight, Leaf, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useConfigurables } from "~/modules/configurables";
import { apiGet } from "~/lib/api.client";

interface InventoryItem {
  _id: string;
  flower_name: string;
  variety?: string;
  quantity: number;
  unit?: string;
  expiry_date: string;
  status: "fresh" | "use_soon" | "critical" | "expired";
  supplier?: string;
  notes?: string;
}

function daysUntilExpiry(expiryDate: string) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

function ExpiryLabel({ days }: { days: number }) {
  if (days <= 0) return <span className="text-xs font-semibold text-rose-600">Expired</span>;
  if (days === 1) return <span className="text-xs font-semibold text-rose-600">Expires today</span>;
  if (days <= 2) return <span className="text-xs font-semibold text-rose-600">{days} days left</span>;
  return <span className="text-xs font-semibold text-amber-600">{days} days left</span>;
}

function UrgencyBar({ days }: { days: number }) {
  const pct = Math.max(0, Math.min(100, (days / 7) * 100));
  const color = days <= 0 ? "bg-slate-400" : days <= 1 ? "bg-rose-500" : days <= 3 ? "bg-amber-500" : "bg-emerald-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function SpoilagePage() {
  const { config, loading: configLoading } = useConfigurables();
  const [atRisk, setAtRisk] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const threshold = configLoading ? 3 : (config?.spoilageAlertThresholdDays ?? 3);

  async function fetchAtRisk() {
    const res = await apiGet<InventoryItem[]>("/api/inventory/at-risk", { threshold });
    if (res.success && res.data) setAtRisk(res.data);
  }

  useEffect(() => {
    setLoading(true);
    fetchAtRisk().finally(() => setLoading(false));
  }, [threshold]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAtRisk();
    setRefreshing(false);
  }

  const critical = atRisk.filter((i) => i.status === "critical" || daysUntilExpiry(i.expiry_date) <= 1);
  const useSoon = atRisk.filter((i) => i.status === "use_soon" && daysUntilExpiry(i.expiry_date) > 1);
  const expired = atRisk.filter((i) => i.status === "expired" || daysUntilExpiry(i.expiry_date) <= 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Spoilage Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            At-risk stock overview. Use these stems first to minimize waste.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl shadow-sm border-rose-100 bg-rose-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-700">Critical</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">{critical.length}</p>
                <p className="text-xs text-rose-600 mt-0.5">Expires within 24 hours</p>
              </div>
              <div className="rounded-xl bg-rose-100 p-3">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-amber-100 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Use Soon</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">{useSoon.length}</p>
                <p className="text-xs text-amber-600 mt-0.5">Within {threshold} days</p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3">
                <Leaf className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Expired</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{expired.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Past expiry date</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <AlertTriangle className="h-6 w-6 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No alerts */}
      {!loading && atRisk.length === 0 && (
        <Card className="rounded-xl shadow-sm border-emerald-100 bg-emerald-50">
          <CardContent className="py-12 text-center">
            <Leaf className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
            <p className="text-lg font-semibold text-emerald-800">All stock is fresh!</p>
            <p className="text-sm text-emerald-600 mt-1">
              No items are at risk of spoilage in the next {threshold} days.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Critical items */}
      {critical.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Critical — Use Immediately
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {critical.map((item) => {
              const days = daysUntilExpiry(item.expiry_date);
              return (
                <Card key={item._id} className="rounded-xl shadow-sm border-rose-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.flower_name}</p>
                        {item.variety && <p className="text-xs text-slate-500">{item.variety}</p>}
                      </div>
                      <Badge variant="rose">Critical</Badge>
                    </div>
                    <UrgencyBar days={days} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {item.quantity} {item.unit ?? "stems"} available
                      </span>
                      <ExpiryLabel days={days} />
                    </div>
                    <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      Route into priority orders now to avoid waste.
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Use soon items */}
      {useSoon.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-amber-700 flex items-center gap-2">
            <Leaf className="h-4 w-4" /> Use Soon — Within {threshold} Days
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useSoon.map((item) => {
              const days = daysUntilExpiry(item.expiry_date);
              return (
                <Card key={item._id} className="rounded-xl shadow-sm border-amber-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.flower_name}</p>
                        {item.variety && <p className="text-xs text-slate-500">{item.variety}</p>}
                      </div>
                      <Badge variant="amber">Use Soon</Badge>
                    </div>
                    <UrgencyBar days={days} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {item.quantity} {item.unit ?? "stems"} available
                      </span>
                      <ExpiryLabel days={days} />
                    </div>
                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Prioritize for upcoming orders this week.
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Expired — Remove from Stock
          </h2>
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <th className="px-4 py-3 text-left">Flower</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Expired</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expired.map((item) => {
                    const days = daysUntilExpiry(item.expiry_date);
                    return (
                      <tr key={item._id} className="text-slate-500">
                        <td className="px-4 py-3">
                          <span className="font-medium line-through">{item.flower_name}</span>
                          {item.variety && <span className="ml-1 text-xs">({item.variety})</span>}
                        </td>
                        <td className="px-4 py-3">
                          {item.quantity} {item.unit ?? "stems"}
                        </td>
                        <td className="px-4 py-3">
                          {Math.abs(days)} day{Math.abs(days) !== 1 ? "s" : ""} ago
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to="/dashboard/inventory"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            Remove in inventory <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
