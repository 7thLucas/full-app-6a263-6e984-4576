import { Settings, User, Store, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";

export default function SettingsPage() {
  const { config, loading } = useConfigurables();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your shop and account preferences.</p>
      </div>

      {/* Account */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <User className="h-4 w-4 text-slate-500" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Username</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.username ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</p>
              <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                {user?.role?.replace(/_/g, " ") ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Info */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Store className="h-4 w-4 text-slate-500" />
            Shop Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Shop Name</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{config?.appName ?? "Florista"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tagline</p>
                <p className="mt-1 text-sm text-slate-700">{config?.tagline ?? "—"}</p>
              </div>
              {config?.shopAddress && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</p>
                  <p className="mt-1 text-sm text-slate-700">{config.shopAddress}</p>
                </div>
              )}
              {config?.shopPhone && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</p>
                  <p className="mt-1 text-sm text-slate-700">{config.shopPhone}</p>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400">
            Shop details are managed in the app configuration panel.
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Bell className="h-4 w-4 text-slate-500" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Spoilage Alert Threshold
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {config?.spoilageAlertThresholdDays ?? 3} days
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Items Per Page
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {config?.defaultItemsPerPage ?? 20}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Delivery Module
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {config?.enableDeliveryModule ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Spoilage Dashboard
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {config?.enableSpoilageDashboard ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400">
            Preferences are managed in the app configuration panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
