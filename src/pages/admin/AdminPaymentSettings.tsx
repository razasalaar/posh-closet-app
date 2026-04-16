import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { CreditCard, Landmark, Phone } from "lucide-react";

export default function AdminPaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    easypaisa_number: "",
    jazzcash_number: "",
    bank_name: "",
    account_title: "",
    account_number: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettingsId(data.id);
        setFormData({
          easypaisa_number: data.easypaisa_number || "",
          jazzcash_number: data.jazzcash_number || "",
          bank_name: data.bank_name || "",
          account_title: data.account_title || "",
          account_number: data.account_number || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (settingsId) {
        const { error } = await supabase
          .from("payment_settings")
          .update(formData)
          .eq("id", settingsId);
        
        if (error) throw error;
      } else {
        const { error, data } = await supabase
          .from("payment_settings")
          .insert([formData])
          .select()
          .single();
          
        if (error) throw error;
        if (data) setSettingsId(data.id);
      }
      
      toast.success("Payment settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading tracking-wider">Payment Settings</h1>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <p className="text-muted-foreground font-body text-sm">
          These details will be displayed to customers when they select Cash on Delivery requiring an advance payment.
        </p>

        <div className="grid gap-6">
          <div className="p-6 border border-border bg-card rounded-lg space-y-4">
            <h2 className="text-lg font-heading tracking-wide flex items-center gap-2">
              <Phone size={18} /> Mobile Wallets
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="easypaisa_number">Easypaisa Number</Label>
                <Input 
                  id="easypaisa_number"
                  name="easypaisa_number" 
                  value={formData.easypaisa_number} 
                  onChange={handleChange} 
                  placeholder="03XXXXXXXXX"
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jazzcash_number">JazzCash Number</Label>
                <Input 
                  id="jazzcash_number"
                  name="jazzcash_number" 
                  value={formData.jazzcash_number} 
                  onChange={handleChange} 
                  placeholder="03XXXXXXXXX"
                  className="font-body"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border border-border bg-card rounded-lg space-y-4">
            <h2 className="text-lg font-heading tracking-wide flex items-center gap-2">
              <Landmark size={18} /> Bank Transfer
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input 
                  id="bank_name"
                  name="bank_name" 
                  value={formData.bank_name} 
                  onChange={handleChange} 
                  placeholder="e.g. Meezan Bank"
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_title">Account Title</Label>
                <Input 
                  id="account_title"
                  name="account_title" 
                  value={formData.account_title} 
                  onChange={handleChange} 
                  placeholder="e.g. Mansa Mussa"
                  className="font-body"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input 
                id="account_number"
                name="account_number" 
                value={formData.account_number} 
                onChange={handleChange} 
                placeholder="XXXXXXXXXXXX"
                className="font-body"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
