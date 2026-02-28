import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllTools, useCategories, useCreateTool, useUpdateTool, useDeleteTool,
  useCreateCategory, useDeleteCategory, type Tool
} from '@/hooks/useTools';
import { toast } from 'sonner';

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const emptyTool = {
  name: '', slug: '', short_description: '', full_description: '',
  category_id: null as string | null, website_url: '', cover_image: '', logo_image: '',
  shared_enabled: false, shared_email: '', shared_password: '',
  status: 'published', featured: false,
};

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const { data: tools } = useAllTools();
  const { data: categories } = useCategories();
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();
  const deleteTool = useDeleteTool();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [toolForm, setToolForm] = useState(emptyTool);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [catName, setCatName] = useState('');

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleToolSubmit = async () => {
    const slug = toolForm.slug || generateSlug(toolForm.name);
    const payload = { ...toolForm, slug, category_id: toolForm.category_id || null };

    try {
      if (editingId) {
        await updateTool.mutateAsync({ id: editingId, ...payload });
        toast.success('Tool updated');
      } else {
        await createTool.mutateAsync(payload);
        toast.success('Tool created');
      }
      setToolDialogOpen(false);
      setToolForm(emptyTool);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingId(tool.id);
    setToolForm({
      name: tool.name, slug: tool.slug, short_description: tool.short_description,
      full_description: tool.full_description || '', category_id: tool.category_id,
      website_url: tool.website_url, cover_image: tool.cover_image || '',
      logo_image: tool.logo_image || '', shared_enabled: tool.shared_enabled,
      shared_email: tool.shared_email || '', shared_password: tool.shared_password || '',
      status: tool.status, featured: tool.featured,
    });
    setToolDialogOpen(true);
  };

  const handleAddCategory = async () => {
    if (!catName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: catName, slug: generateSlug(catName) });
      setCatName('');
      toast.success('Category created');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

          <Tabs defaultValue="tools">
            <TabsList className="mb-6">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="tools">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">{tools?.length || 0} tools</p>
                <Dialog open={toolDialogOpen} onOpenChange={(o) => { setToolDialogOpen(o); if (!o) { setToolForm(emptyTool); setEditingId(null); } }}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary border-0 text-primary-foreground rounded-lg">
                      <Plus className="h-4 w-4 mr-1" /> Add Tool
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Tool' : 'Add Tool'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value, slug: generateSlug(e.target.value) })} />
                        </div>
                        <div>
                          <Label>Slug</Label>
                          <Input value={toolForm.slug} onChange={(e) => setToolForm({ ...toolForm, slug: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label>Short Description</Label>
                        <Input value={toolForm.short_description} onChange={(e) => setToolForm({ ...toolForm, short_description: e.target.value })} maxLength={120} />
                      </div>
                      <div>
                        <Label>Full Description</Label>
                        <Textarea value={toolForm.full_description} onChange={(e) => setToolForm({ ...toolForm, full_description: e.target.value })} rows={4} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={toolForm.category_id || 'none'} onValueChange={(v) => setToolForm({ ...toolForm, category_id: v === 'none' ? null : v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Website URL</Label>
                          <Input value={toolForm.website_url} onChange={(e) => setToolForm({ ...toolForm, website_url: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cover Image URL</Label>
                          <Input value={toolForm.cover_image} onChange={(e) => setToolForm({ ...toolForm, cover_image: e.target.value })} />
                        </div>
                        <div>
                          <Label>Logo Image URL</Label>
                          <Input value={toolForm.logo_image} onChange={(e) => setToolForm({ ...toolForm, logo_image: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch checked={toolForm.featured} onCheckedChange={(v) => setToolForm({ ...toolForm, featured: v })} />
                          <Label>Featured</Label>
                        </div>
                        <div>
                          <Select value={toolForm.status} onValueChange={(v) => setToolForm({ ...toolForm, status: v })}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Switch checked={toolForm.shared_enabled} onCheckedChange={(v) => setToolForm({ ...toolForm, shared_enabled: v })} />
                          <Label>Enable Shared Login Credentials</Label>
                        </div>
                        {toolForm.shared_enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Shared Email</Label>
                              <Input value={toolForm.shared_email} onChange={(e) => setToolForm({ ...toolForm, shared_email: e.target.value })} />
                            </div>
                            <div>
                              <Label>Shared Password</Label>
                              <Input value={toolForm.shared_password} onChange={(e) => setToolForm({ ...toolForm, shared_password: e.target.value })} />
                            </div>
                          </div>
                        )}
                      </div>
                      <Button onClick={handleToolSubmit} className="w-full gradient-primary border-0 text-primary-foreground rounded-lg">
                        {editingId ? 'Update Tool' : 'Create Tool'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-card rounded-lg shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools?.map((tool) => (
                      <tr key={tool.id} className="border-b border-border last:border-0">
                        <td className="p-4 font-medium text-card-foreground">{tool.name}</td>
                        <td className="p-4 hidden md:table-cell">
                          {tool.categories ? <Badge variant="secondary">{tool.categories.name}</Badge> : '—'}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant={tool.status === 'published' ? 'default' : 'secondary'}>
                            {tool.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(tool)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            if (confirm('Delete this tool?')) deleteTool.mutate(tool.id);
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!tools || tools.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No tools yet. Add your first tool!</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="flex gap-3 mb-6">
                <Input placeholder="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} className="max-w-xs" />
                <Button onClick={handleAddCategory} className="gradient-primary border-0 text-primary-foreground rounded-lg">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="bg-card rounded-lg shadow-card">
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                    <span className="font-medium text-card-foreground">{cat.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm('Delete this category?')) deleteCategory.mutate(cat.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No categories yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
