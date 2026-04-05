import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

interface ProductForm {
  name: string;
  brand: string;
  price: string;
  category_id: string;
  description: string;
  rating: string;
  is_featured: boolean;
}

const emptyForm: ProductForm = { name: '', brand: 'LUXE', price: '', category_id: '', description: '', rating: '4.5', is_featured: false };

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(name, type)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      category_id: p.category_id || '',
      description: p.description || '',
      rating: String(p.rating),
      is_featured: p.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const handleSave = async () => {
    setSaving(true);
    let image_url: string | undefined;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    const payload: any = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      category_id: form.category_id || null,
      description: form.description,
      rating: Number(form.rating),
      is_featured: form.is_featured,
    };
    if (image_url) {
      payload.image_url = image_url;
      payload.images = [image_url];
    }

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl tracking-wider">Products</h1>
        <Button variant="luxury" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          <Plus size={14} /> Add Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">{editingId ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Price (PKR)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Category</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-body"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Rating</Label>
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="mt-1 font-body" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              <Label className="font-body text-xs">Featured Product</Label>
            </div>
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wide">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm font-body resize-none"
            />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wide">Product Image</Label>
            <div className="mt-1 flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Upload size={14} />
                <span className="text-xs font-body">{imageFile ? imageFile.name : 'Choose file'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <Button variant="luxury" onClick={handleSave} disabled={saving || !form.name || !form.price}>
            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border border-border rounded-lg p-3">
            <div className="w-12 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground font-body">{p.brand} • {p.categories?.name || 'No category'}</p>
            </div>
            <p className="text-sm font-body font-bold">{formatPrice(p.price)}</p>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No products yet. Add your first product!</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
