import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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

type FlowerStatus = "fresh" | "use_soon" | "critical" | "expired";

interface InventoryItem {
  _id: string;
  flower_name: string;
  variety?: string;
  quantity: number;
  unit?: string;
  purchase_date: string;
  shelf_life_days: number;
  expiry_date: string;
  status: FlowerStatus;
  supplier?: string;
  cost_per_unit?: number;
  notes?: string;
}

const statusConfig: Record<FlowerStatus, { label: string; variant: "emerald" | "amber" | "rose" | "slate" }> = {
  fresh: { label: "Fresh", variant: "emerald" },
  use_soon: { label: "Use Soon", variant: "amber" },
  critical: { label: "Critical", variant: "rose" },
  expired: { label: "Expired", variant: "slate" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntilExpiry(expiryDate: string) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `${days} days left`;
}

const emptyForm = {
  flower_name: "",
  variety: "",
  quantity: "",
  unit: "stems",
  purchase_date: new Date().toISOString().split("T")[0],
  shelf_life_days: "",
  supplier: "",
  cost_per_unit: "",
  notes: "",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<InventoryItem[]>("/api/inventory");
    if (res.success && res.data) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.flower_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.variety?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setForm({
      flower_name: item.flower_name,
      variety: item.variety ?? "",
      quantity: String(item.quantity),
      unit: item.unit ?? "stems",
      purchase_date: item.purchase_date.split("T")[0],
      shelf_life_days: String(item.shelf_life_days),
      supplier: item.supplier ?? "",
      cost_per_unit: item.cost_per_unit ? String(item.cost_per_unit) : "",
      notes: item.notes ?? "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.flower_name.trim()) { setError("Flower name is required"); return; }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      setError("Quantity must be a valid non-negative number");
      return;
    }
    if (!form.shelf_life_days || isNaN(Number(form.shelf_life_days)) || Number(form.shelf_life_days) < 1) {
      setError("Shelf life must be a positive number");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      flower_name: form.flower_name.trim(),
      variety: form.variety.trim() || undefined,
      quantity: Number(form.quantity),
      unit: form.unit || "stems",
      purchase_date: form.purchase_date,
      shelf_life_days: Number(form.shelf_life_days),
      supplier: form.supplier.trim() || undefined,
      cost_per_unit: form.cost_per_unit ? Number(form.cost_per_unit) : undefined,
      notes: form.notes.trim() || undefined,
    };

    const res = editItem
      ? await apiRequest(`/api/inventory/${editItem._id}`, { method: "PUT", data: payload })
      : await apiRequest("/api/inventory", { method: "POST", data: payload });

    if (res.success) {
      setDialogOpen(false);
      fetchItems();
    } else {
      setError(res.message ?? "Failed to save item");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inventory item?")) return;
    await apiRequest(`/api/inventory/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Flower Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Track stock levels, shelf life, and freshness status.</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Flower
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or variety..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="fresh">Fresh</option>
          <option value="use_soon">Use Soon</option>
          <option value="critical">Critical</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      {/* Table */}
      <Card className="rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <CardContent className="py-16 text-center text-slate-400">Loading inventory...</CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-16 text-center">
            <Sprout className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">No inventory items found.</p>
            <p className="text-xs text-slate-400 mt-1">Add your first flower to get started.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Flower</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Purchased</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const sc = statusConfig[item.status];
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.flower_name}</div>
                        {item.variety && <div className="text-xs text-slate-400">{item.variety}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.quantity} {item.unit ?? "stems"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.purchase_date)}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{formatDate(item.expiry_date)}</div>
                        <div className="text-xs text-slate-400">{daysUntilExpiry(item.expiry_date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.supplier ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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
            <DialogTitle>{editItem ? "Edit Inventory Item" : "Add Flower"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="flower_name">Flower Name *</Label>
                <Input
                  id="flower_name"
                  placeholder="e.g. Rose"
                  value={form.flower_name}
                  onChange={(e) => setForm({ ...form, flower_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  placeholder="e.g. Red Velvet"
                  value={form.variety}
                  onChange={(e) => setForm({ ...form, variety: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="stems">Stems</option>
                  <option value="bunches">Bunches</option>
                  <option value="pots">Pots</option>
                  <option value="boxes">Boxes</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shelf_life_days">Shelf Life (days) *</Label>
                <Input
                  id="shelf_life_days"
                  type="number"
                  min="1"
                  placeholder="7"
                  value={form.shelf_life_days}
                  onChange={(e) => setForm({ ...form, shelf_life_days: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="purchase_date">Purchase Date *</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g. Green Valley Farms"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.cost_per_unit}
                  onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? "Saving..." : editItem ? "Update" : "Add Flower"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
