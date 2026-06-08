import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, ShoppingBag, ChevronDown } from "lucide-react";
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

type OrderStatus = "pending" | "in_progress" | "ready" | "out_for_delivery" | "fulfilled" | "cancelled";

interface Order {
  _id: string;
  order_number: string;
  customer: { name: string; phone?: string; email?: string };
  occasion: string;
  arrangement_description?: string;
  flowers_requested: string[];
  status: OrderStatus;
  requested_delivery_date?: string;
  delivery_address?: string;
  total_price?: number;
  notes?: string;
  assigned_staff?: string;
  createdAt: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: "emerald" | "amber" | "rose" | "slate" }> = {
  pending: { label: "Pending", variant: "slate" },
  in_progress: { label: "In Progress", variant: "amber" },
  ready: { label: "Ready", variant: "emerald" },
  out_for_delivery: { label: "Out for Delivery", variant: "amber" },
  fulfilled: { label: "Fulfilled", variant: "emerald" },
  cancelled: { label: "Cancelled", variant: "rose" },
};

const occasionOptions = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "wedding", label: "Wedding" },
  { value: "funeral", label: "Funeral" },
  { value: "valentines_day", label: "Valentine's Day" },
  { value: "mothers_day", label: "Mother's Day" },
  { value: "graduation", label: "Graduation" },
  { value: "get_well", label: "Get Well" },
  { value: "congratulations", label: "Congratulations" },
  { value: "other", label: "Other" },
];

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const emptyForm = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  occasion: "other",
  arrangement_description: "",
  flowers_requested: "",
  requested_delivery_date: "",
  delivery_address: "",
  total_price: "",
  notes: "",
  assigned_staff: "",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Order[]>("/api/orders");
    if (res.success && res.data) setOrders(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditOrder(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(order: Order) {
    setEditOrder(order);
    setForm({
      customer_name: order.customer.name,
      customer_phone: order.customer.phone ?? "",
      customer_email: order.customer.email ?? "",
      occasion: order.occasion,
      arrangement_description: order.arrangement_description ?? "",
      flowers_requested: order.flowers_requested.join(", "),
      requested_delivery_date: order.requested_delivery_date
        ? order.requested_delivery_date.split("T")[0]
        : "",
      delivery_address: order.delivery_address ?? "",
      total_price: order.total_price ? String(order.total_price) : "",
      notes: order.notes ?? "",
      assigned_staff: order.assigned_staff ?? "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.customer_name.trim()) { setError("Customer name is required"); return; }

    setSaving(true);
    setError("");
    const payload = {
      customer: {
        name: form.customer_name.trim(),
        phone: form.customer_phone.trim() || undefined,
        email: form.customer_email.trim() || undefined,
      },
      occasion: form.occasion,
      arrangement_description: form.arrangement_description.trim() || undefined,
      flowers_requested: form.flowers_requested
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      requested_delivery_date: form.requested_delivery_date || undefined,
      delivery_address: form.delivery_address.trim() || undefined,
      total_price: form.total_price ? Number(form.total_price) : undefined,
      notes: form.notes.trim() || undefined,
      assigned_staff: form.assigned_staff.trim() || undefined,
    };

    const res = editOrder
      ? await apiRequest(`/api/orders/${editOrder._id}`, { method: "PUT", data: payload })
      : await apiRequest("/api/orders", { method: "POST", data: payload });

    if (res.success) {
      setDialogOpen(false);
      fetchOrders();
    } else {
      setError(res.message ?? "Failed to save order");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    await apiRequest(`/api/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  }

  async function handleStatusChange(id: string, status: OrderStatus) {
    await apiRequest(`/api/orders/${id}/status`, { method: "PATCH", data: { status } });
    fetchOrders();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bouquet Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Create and track every bouquet order from start to fulfillment.</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by customer or order number..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
      </div>

      <Card className="rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <CardContent className="py-16 text-center text-slate-400">Loading orders...</CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">No orders found.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Occasion</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => {
                  const sc = statusConfig[order.status];
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{order.customer.name}</div>
                        {order.customer.phone && (
                          <div className="text-xs text-slate-400">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {order.occasion.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(order.requested_delivery_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {order.total_price ? `$${order.total_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="h-7 min-w-32 text-xs py-0"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(order)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editOrder ? "Edit Order" : "New Order"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  placeholder="Full name"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input
                  id="customer_phone"
                  placeholder="+1 555 000 0000"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="customer@email.com"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Details</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="occasion">Occasion</Label>
                <Select
                  id="occasion"
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                >
                  {occasionOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="arrangement_description">Arrangement Description</Label>
                <Textarea
                  id="arrangement_description"
                  placeholder="Describe the bouquet arrangement..."
                  value={form.arrangement_description}
                  onChange={(e) => setForm({ ...form, arrangement_description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="flowers_requested">Flowers Requested</Label>
                <Input
                  id="flowers_requested"
                  placeholder="e.g. Roses, Tulips, Lilies (comma separated)"
                  value={form.flowers_requested}
                  onChange={(e) => setForm({ ...form, flowers_requested: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="requested_delivery_date">Delivery Date</Label>
                <Input
                  id="requested_delivery_date"
                  type="date"
                  value={form.requested_delivery_date}
                  onChange={(e) => setForm({ ...form, requested_delivery_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="total_price">Total Price ($)</Label>
                <Input
                  id="total_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.total_price}
                  onChange={(e) => setForm({ ...form, total_price: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Input
                  id="delivery_address"
                  placeholder="Full delivery address"
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="assigned_staff">Assigned Staff</Label>
                <Input
                  id="assigned_staff"
                  placeholder="Staff member name"
                  value={form.assigned_staff}
                  onChange={(e) => setForm({ ...form, assigned_staff: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="order_notes">Notes</Label>
                <Textarea
                  id="order_notes"
                  placeholder="Additional notes..."
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
              {saving ? "Saving..." : editOrder ? "Update Order" : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
