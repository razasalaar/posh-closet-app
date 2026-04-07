import { useEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CategoryType = Database['public']['Enums']['category_type'];

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('men');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  // Ref keeps the ID stable even after state is cleared by onOpenChange
  const deleteTargetRef = useRef<string | null>(null);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('type').order('name');
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setType(c.type);
    setShowForm(true);
  };

  const handleDelete = async () => {
    // Use ref value — state may already be null due to onOpenChange firing before onConfirm
    const idToDelete = deleteTargetRef.current;
    if (!idToDelete) return;
    const { error, count } = await supabase
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', idToDelete);
    if (error) {
      toast.error(`Failed to delete category: ${error.message}`);
    } else if (count === 0) {
      toast.error('Delete failed: permission denied or not found.');
    } else {
      toast.success('Category deleted');
      fetchCategories();
    }
    deleteTargetRef.current = null;
    setDeleteTarget(null);
  };


  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('categories').update({ name: name.trim(), type }).eq('id', editingId);
      if (error) toast.error('Failed to update category');
      else toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert({ name: name.trim(), type });
      if (error) toast.error('Failed to add category');
      else toast.success('Category added');
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setName('');
    fetchCategories();
  };

  const menCats = categories.filter((c) => c.type === 'men');
  const womenCats = categories.filter((c) => c.type === 'women');

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl tracking-wider">Categories</h1>
        <Button variant="luxury" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setName(''); }}>
          <Plus size={14} /> Add Category
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value as CategoryType)} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-body">
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>
          </div>
          <Button variant="luxury" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Category'}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ title: 'Men', items: menCats }, { title: 'Women', items: womenCats }].map((group) => (
          <div key={group.title}>
            <h3 className="font-heading text-lg tracking-wider mb-3">{group.title}</h3>
            <div className="space-y-2">
              {group.items.length === 0 && (
                <p className="text-xs text-muted-foreground font-body py-4 text-center">No categories yet</p>
              )}
              {group.items.map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                  <span className="text-sm font-body font-medium">{c.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
                    <button onClick={() => { deleteTargetRef.current = c.id; setDeleteTarget(c.id); }} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Category"
        description="Are you sure you want to delete this category? Products in this category won't be deleted but will become uncategorized."
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default AdminCategories;
