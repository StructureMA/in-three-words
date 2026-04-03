import { createClient } from "@/lib/supabase/server";
import type { SiteSetting } from "@/lib/types";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = (await supabase
    .from("site_settings")
    .select("*")
    .order("key")) as { data: SiteSetting[] | null; error: unknown };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Settings</h1>
      <p className="text-sm text-[#6B6B6B] mb-6">
        Manage site-wide configuration.
      </p>
      <SettingsForm settings={settings ?? []} />
    </div>
  );
}
