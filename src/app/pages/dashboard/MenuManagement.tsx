import { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, X, Coffee, UtensilsCrossed, Cake, Wine, IceCream, Loader2 } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  foodType?: 'Veg' | 'Non-Veg';
  available: boolean;
}

export default function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useOrders();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    foodType: 'Veg',
    available: true
  });
  const [activeTab, setActiveTab] = useState<string>('All');

  const categories = [
    { value: 'Food', icon: UtensilsCrossed, color: 'bg-yellow-100 text-yellow-600' },
    { value: 'Beverages', icon: Coffee, color: 'bg-blue-100 text-blue-600' },
    { value: 'Desserts', icon: Cake, color: 'bg-pink-100 text-pink-600' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData({ ...formData, image: result });
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('item_name', formData.name);
      payload.append('description_food', formData.description);
      payload.append('price', formData.price);
      payload.append('Category', formData.category);
      payload.append('food_type', formData.foodType);
      payload.append('available', String(formData.available));

      if (selectedFile) {
        payload.append('image', selectedFile);
      } else if (editingItem && formData.image) {
        payload.append('image_url', formData.image);
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
        toast.success('Menu item updated successfully!');
      } else {
        await addMenuItem(payload);
        toast.success('Menu item added successfully!');
      }

      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      foodType: 'Veg',
      available: true
    });
    setImagePreview('');
    setSelectedFile(null);
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      foodType: item.foodType || 'Veg',
      available: item.available ?? true
    });
    setImagePreview(item.image);
    setSelectedFile(null);
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      await deleteMenuItem(id);
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsAddDialogOpen(open);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat || categories[0];
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your cafe menu items</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 size-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details of your menu item' : 'Add a new item to your cafe menu'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Item Image *</Label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedFile(null);
                          setFormData({ ...formData, image: '' });
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                      <Upload className="size-12 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                      <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cappuccino, Chocolate Cake"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the item..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="120.00"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="size-4" />
                              {cat.value}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Food Type Selector */}
              <div className="space-y-2">
                <Label>Dietary Preference *</Label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.foodType === 'Veg' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" className="hidden" checked={formData.foodType === 'Veg'} onChange={() => setFormData({ ...formData, foodType: 'Veg' })} />
                    <div className={`w-4 h-4 rounded-full border-2 ${formData.foodType === 'Veg' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}></div>
                    <span className={`font-medium ${formData.foodType === 'Veg' ? 'text-green-700' : 'text-gray-600'}`}>Veg</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.foodType === 'Non-Veg' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" className="hidden" checked={formData.foodType === 'Non-Veg'} onChange={() => setFormData({ ...formData, foodType: 'Non-Veg' })} />
                    <div className={`w-4 h-4 rounded-full border-2 ${formData.foodType === 'Non-Veg' ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}></div>
                    <span className={`font-medium ${formData.foodType === 'Non-Veg' ? 'text-red-700' : 'text-gray-600'}`}>Non-Veg</span>
                  </label>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="available" className="text-base font-medium">
                    Availability
                  </Label>
                  <p className="text-sm text-gray-600">
                    {formData.available ? 'Item is currently in stock' : 'Item is out of stock'}
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={checked => setFormData({ ...formData, available: checked })}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {editingItem ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Tabs */}
      {!loading && menuItems.length > 0 && (
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
          {['All', ...categories.map(c => c.value)].map(category => {
            const count = category === 'All'
              ? menuItems.length
              : menuItems.filter(item => item.category === category).length;

            return (
              <Button
                key={category}
                variant={activeTab === category ? "default" : "outline"}
                className={`whitespace-nowrap ${activeTab === category ? "bg-orange-500 hover:bg-orange-600 border-none text-white" : ""}`}
                onClick={() => setActiveTab(category)}
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Menu Items Grid */}
      {loading && menuItems.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
            <Coffee className="size-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No menu items yet</h3>
          <p className="text-gray-500 mb-6">Start building your menu by adding your first item</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems
            .filter(item => activeTab === 'All' || item.category === activeTab)
            .map(item => {
              const categoryInfo = getCategoryIcon(item.category);
              const CategoryIcon = categoryInfo.icon;
              return (
                <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow relative ${!item.available ? 'border-2 border-red-400 opacity-75' : ''}`}>
                  <div className="aspect-square relative">
                    <ImageWithFallback
                      src={item.image ? optimizeCloudinaryUrl(item.image, 500, 'auto', 'webp') : ''}
                      alt={item.name}
                      className={`w-full h-full object-cover ${!item.available ? 'grayscale' : ''}`}
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide shadow-lg">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                      <Badge className={item.available ? 'bg-green-500' : 'bg-red-600 animate-pulse'}>
                        {item.available ? 'In Stock' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className={`w-5 h-5 rounded-sm border-2 ${item.foodType === 'Veg' ? 'border-green-600 bg-white' : 'border-red-600 bg-white'} flex items-center justify-center shadow-sm`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${item.foodType === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className={`${categoryInfo.color} px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium`}>
                        <CategoryIcon className="size-3" />
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-orange-600 whitespace-nowrap">₹{item.price}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}