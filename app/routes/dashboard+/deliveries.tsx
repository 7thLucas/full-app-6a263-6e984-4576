import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Truck, Calendar } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { apiGet, apiRequest } from "~/lib/api.client";

type DeliveryStatus = "scheduled" | "out_for_delivery" | "delivered" | "failed" | "cancelled";

interface Delivery {
  _id: string;
  order?: string;
  order_number?: string;
  customer_name?: string;
  delivery_address: string;
  scheduled_date: string;
  time_window?: string;
  driver_name?: string;
  driver_phone?: string;
  status: DeliveryStatus;
  route_order?: number;
  notes?: string;
  delivered_at?: string;
}

const statusConfig: Record<DeliveryStatus, { label: string; variant: "emerald" | "amber" | "rose" | "slate" }> = {
  scheduled: { label: "Scheduled", variant: "slate" },
  out_for_delivery: { label: "Out for Delivery", variant: "amber" },
  delivered: { label: "Delivered", variant: "emerald" },
  failed: { label: "Failed", variant: "rose" },
  cancelled: { label: "Cancelled", variant: "rose" },
};

const statusOptions: { value: DeliveryStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const emptyForm = {
  order_number: "",
  customer_name: "",
  delivery_address: "",
  scheduled_date: new Date().toISOString().split("T")[0],
  time_window: "",
  driver_name: "",
  driver_phone: "",
  route_order: "",
  notes: "",
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDelivery, setEditDelivery] = useState<Delivery | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    const res = await apiGet<Delivery[]>("/api/deliveries", params);
    if (res.success && res.data) setDeliveries(res.data);
    setLoading(false);
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const filtered = deliveries.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.customer_name?.toLowerCase().includes(q) ?? false) ||
      (d.driver_name?.toLowerCase().includes(q) ?? false) ||
      d.delivery_address.toLowerCase().includes(q) ||
      (d.order_number?.toLowerCase().includes(q) ?? false)
    );
  });

  function openCreate() {
    setEditDelivery(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(delivery: Delivery) {
    setEditDelivery(delivery);
    setForm({
      order_number: delivery.order_number ?? "",
      customer_name: delivery.customer_name ?? "",
      delivery_address: delivery.delivery_address,
      scheduled_date: delivery.scheduled_date.split("T")[0],
      time_window: delivery.time_window ?? "",
      driver_name: delivery.driver_name ?? "",
      driver_phone: delivery.driver_phone ?? "",
      route_order: delivery.route_order ? String(delivery.route_order) : "",
      notes: delivery.notes ?? "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.delivery_address.trim()) { setError("Delivery address is required"); return; }
    if (!form.scheduled_date) { setError("Scheduled date is required"); return; }

    setSaving(true);
    setError("");
    const payload = {
      order_number: form.order_number.trim() || undefined,
      customer_name: form.customer_name.trim() || undefined,
      delivery_address: form.delivery_address.trim(),
      scheduled_date: form.scheduled_date,
      time_window: form.time_window.trim() || undefined,
      driver_name: form.driver_name.trim() || undefined,
      driver_phone: form.driver_phone.trim() || undefined,
      route_order: form.route_order ? Number(form.route_order) : undefined,
      notes: form.notes.trim() || undefined,
    };

    const res = editDelivery
      ? await apiRequest(`/api/deliveries/${editDelivery._id}`, { method: "PUT", data: payload })
      : await apiRequest("/api/deliveries", { method: "POST", data: payload });

    if (res.success) {
      setDialogOpen(false);
      fetchDeliveries();
    } else {
      setError(res.message ?? "Failed to save delivery");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this delivery?")) return;
    await apiRequest(`/api/deliveries/${id}`, { method: "DELETE" });
    fetchDeliveries();
  }

  async function handleStatusChange(id: string, status: DeliveryStatus) {
    await apiRequest(`/api/deliveries/${id}/status`, { method: "PATCH", data: { status } });
    fetchDeliveries();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Delivery Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule deliveries, assign drivers, and track route progress.</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Schedule Delivery
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by customer, driver, or address..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-44">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="date"
            className="pl-9"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear date
          </button>
        )}
      </div>

      <Card className="rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <CardContent className="py-16 text-center text-slate-400">Loading deliveries...</CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-16 text-center">
            <Truck className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">No deliveries found.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time Window</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((delivery) => {
                  const sc = statusConfig[delivery.status];
                  return (
                    <tr key={delivery._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {delivery.route_order ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {delivery.route_order}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{delivery.customer_name ?? "—"}</div>
                        {delivery.order_number && (
                          <div className="text-xs text-slate-400 font-mono">{delivery.order_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate text-slate-700">{delivery.delivery_address}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(delivery.scheduled_date)}</td>
                      <td className="px-4 py-3 text-slate-600">{delivery.time_window ?? "—"}</td>
                      <td className="px-4 py-3">
                        {delivery.driver_name ? (
                          <div>
                            <div className="font-medium text-slate-700">{delivery.driver_name}</div>
                            {delivery.driver_phone && (
                              <div className="text-xs text-slate-400">{delivery.driver_phone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="h-7 min-w-36 text-xs py-0"
                          value={delivery.status}
                          onChange={(e) => handleStatusChange(delivery._id, e.target.value as DeliveryStatus)}
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(delivery)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(delivery._id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDelivery ? "Edit Delivery" : "Schedule Delivery"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="order_number">Order Number</Label>
                <Input
                  id="order_number"
                  placeholder="FLR-2026-0001"
                  value={form.order_number}
                  onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  placeholder="Full name"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="delivery_address">Delivery Address *</Label>
                <Input
                  id="delivery_address"
                  placeholder="Full delivery address"
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time_window">Time Window</Label>
                <Input
                  id="time_window"
                  placeholder="e.g. 10:00 - 12:00"
                  value={form.time_window}
                  onChange={(e) => setForm({ ...form, time_window: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver_name">Driver Name</Label>
                <Input
                  id="driver_name"
                  placeholder="Assign Driver"
                  value={form.driver_name}
                  onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver_phone">Driver Phone</Label>
                <Input
                  id="driver_phone"
                  placeholder="+1 555 000 0000"
                  value={form.driver_phone}
                  onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="route_order">Route Order</Label>
                <Input
                  id="route_order"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.route_order}
                  onChange={(e) => setForm({ ...form, route_order: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="delivery_notes">Notes</Label>
                <Textarea
                  id="delivery_notes"
                  placeholder="Delivery instructions..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? "Saving..." : editDelivery ? "Update Delivery" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
