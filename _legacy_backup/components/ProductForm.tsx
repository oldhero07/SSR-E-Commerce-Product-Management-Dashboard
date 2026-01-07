import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../types';
import { CATEGORIES } from '../constants';
import { Wand2, X, Upload, AlertCircle } from './ui/Icons';
import { generateProductDescription } from '../services/geminiService';
import { z } from 'zod';

interface ProductFormProps {
  initialData?: Product;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

// Zod Schema for validation
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: CATEGORIES[0],
    imageUrl: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { id, createdAt, ...rest } = initialData;
      setFormData(rest);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
    // Clear error for field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setErrors(prev => ({ ...prev, name: "Name is required for AI generation" }));
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL to simulate upload
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: objectUrl }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageUrl;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = productSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                placeholder="e.g., Premium Leather Wallet"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none ${errors.stock ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none ${errors.price ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
             
            {/* Image Upload Area */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
              <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${errors.imageUrl ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'}`}>
                {formData.imageUrl ? (
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden group">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, imageUrl: ''}))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center w-full">
                    <Upload className="text-slate-400 mb-2" size={32} />
                    <span className="text-sm text-slate-600 font-medium">Click to upload image</span>
                    <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                 <AlertCircle size={12} />
                 <span>Images are locally previewed. In production, this would upload to Cloudinary.</span>
              </div>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !formData.name}
                  className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Wand2 size={14} />
                  {isGenerating ? 'Gemini AI generating...' : 'Auto-Generate with Gemini AI'}
                </button>
              </div>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                placeholder="Enter product description..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-600/20"
            >
              {isSaving ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;