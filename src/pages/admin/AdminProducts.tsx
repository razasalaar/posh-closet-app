import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash2, X, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const TROUSER_SIZES = ['30', '32', '34', '36', '38', '40'];

interface ProductForm {
  name: string;
  brand: string;
  price: string;
  category_id: string;
  description: string;
  rating: string;
  is_featured: boolean;
  size_type: string;
}

const emptyForm: ProductForm = { name: '', brand: 'LUXE', price: '', category_id: '', description: '', rating: '4.5', is_featured: false, size_type: '' };

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<(File | null)[]>([null, null, null]);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(name, type)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = async (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      category_id: p.category_id || '',
      description: p.description || '',
      rating: String(p.rating),
      is_featured: p.is_featured,
      size_type: p.size_type || '',
    });
    setMainImage(null);
    setExtraImages([null, null, null]);
    if (p.size_type) {
      const { data: sizesData } = await supabase
        .from('product_sizes')
        .select('size_label, quantity')
        .eq('product_id', p.id);
      const sq: Record<string, number> = {};
      (sizesData || []).forEach((s: any) => { sq[s.size_label] = s.quantity; });
      setSizeQuantities(sq);
    } else {
      setSizeQuantities({});
    }
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget);
    if (error) toast.error('Failed to delete product');
    else toast.success('Product deleted');
    setDeleteTarget(null);
    fetchData();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    let image_url: string | undefined;
    const allImageUrls: string[] = [];

    if (mainImage) {
      const url = await uploadImage(mainImage);
      if (url) { image_url = url; allImageUrls.push(url); }
    }

    for (const file of extraImages) {
      if (file) {
        const url = await uploadImage(file);
        if (url) allImageUrls.push(url);
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
      size_type: form.size_type || null,
    };
    if (image_url) payload.image_url = image_url;
    if (allImageUrls.length > 0) {
      if (editingId && !mainImage) {
        const existing = products.find(p => p.id === editingId);
        if (existing?.image_url) allImageUrls.unshift(existing.image_url);
      }
      payload.images = allImageUrls;
    }

    let productId = editingId;
    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      if (!image_url) {
        payload.image_url = null;
        payload.images = allImageUrls.length > 0 ? allImageUrls : [];
      }
      const { data } = await supabase.from('products').insert(payload).select().single();
      if (data) productId = data.id;
    }

    if (productId && form.size_type) {
      await supabase.from('product_sizes').delete().eq('product_id', productId);
      const sizeLabels = form.size_type === 'shirt' ? SHIRT_SIZES : TROUSER_SIZES;
      const sizeRows = sizeLabels.map(label => ({
        product_id: productId!,
        size_label: label,
        quantity: sizeQuantities[label] || 0,
      }));
      await supabase.from('product_sizes').insert(sizeRows);
    } else if (productId && !form.size_type) {
      await supabase.from('product_sizes').delete().eq('product_id', productId);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMainImage(null);
    setExtraImages([null, null, null]);
    setSizeQuantities({});
    toast.success(editingId ? 'Product updated' : 'Product added');
    fetchData();
  };

  const currentSizeLabels = form.size_type === 'shirt' ? SHIRT_SIZES : form.size_type === 'trouser' ? TROUSER_SIZES : [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl tracking-wider">Products</h1>
        <Button variant="luxury" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setSizeQuantities({}); }}>
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
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-body">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
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
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm font-body resize-none" />
          </div>

          <div className="space-y-3">
            <Label className="font-body text-xs uppercase tracking-wide">Main Image</Label>
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors w-fit">
              <Upload size={14} />
              <span className="text-xs font-body">{mainImage ? mainImage.name : 'Choose main image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setMainImage(e.target.files?.[0] || null)} />
            </label>

            <Label className="font-body text-xs uppercase tracking-wide">Additional Images (up to 3)</Label>
            <div className="flex gap-3">
              {[0, 1, 2].map((idx) => (
                <label key={idx} className="flex items-center gap-1 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Image size={14} />
                  <span className="text-[10px] font-body">{extraImages[idx] ? extraImages[idx]!.name.slice(0, 10) + '...' : `Image ${idx + 1}`}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const newArr = [...extraImages];
                    newArr[idx] = e.target.files?.[0] || null;
                    setExtraImages(newArr);
                  }} />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-body text-xs uppercase tracking-wide">Size Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" checked={form.size_type === 'shirt'} onChange={(e) => {
                  setForm({ ...form, size_type: e.target.checked ? 'shirt' : '' });
                  if (!e.target.checked) setSizeQuantities({});
                }} />
                Shirts (S–XXXL)
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" checked={form.size_type === 'trouser'} onChange={(e) => {
                  setForm({ ...form, size_type: e.target.checked ? 'trouser' : '' });
                  if (!e.target.checked) setSizeQuantities({});
                }} />
                Trousers (30–40)
              </label>
            </div>

            {currentSizeLabels.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {currentSizeLabels.map((label) => (
                  <div key={label} className="space-y-1">
                    <Label className="font-body text-[10px] uppercase text-muted-foreground">{label}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeQuantities[label] || 0}
                      onChange={(e) => setSizeQuantities({ ...sizeQuantities, [label]: parseInt(e.target.value) || 0 })}
                      className="font-body text-sm h-9"
                    />
                  </div>
                ))}
              </div>
            )}
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
              <p className="text-xs text-muted-foreground font-body">
                {p.brand} • {p.categories?.name || 'No category'}
                {p.size_type && ` • ${p.size_type === 'shirt' ? 'Shirt sizes' : 'Trouser sizes'}`}
              </p>
            </div>
            <p className="text-sm font-body font-bold">{formatPrice(p.price)}</p>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
              <button onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No products yet. Add your first product!</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
