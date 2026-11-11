import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Package } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Pastries & Viennoiserie',
    unit_of_measure: 'PCS',
    cost_price: '',
    price: '',
    stock_quantity: 25,
    reorder_level: 10,
    image_url: '',
    description: '',
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || 'Pastries & Viennoiserie',
        unit_of_measure: item.unit_of_measure || 'PCS',
        cost_price: item.cost_price !== undefined ? item.cost_price : '',
        price: item.price !== undefined ? item.price : '',
        stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 0,
        reorder_level: item.reorder_level !== undefined ? item.reorder_level : 10,
        image_url: item.image_url || '',
        description: item.description || '',
        status: item.status || 'ACTIVE',
      });
    } else {
      const randomId = Math.floor(100 + Math.random() * 900);
      setFormData({
        name: '',
        sku: `BAKE-${randomId}`,
        category: 'Pastries & Viennoiserie',
        unit_of_measure: 'PCS',
        cost_price: '',
        price: '',
        stock_quantity: 50,
        reorder_level: 15,
        image_url: '',
        description: '',
        status: 'ACTIVE',
      });
    }
    setError('');
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || formData.price === '') {
      setError('Please fill in Item Name, SKU, and Selling Price.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        ...formData,
        cost_price: parseFloat(formData.cost_price) || 0,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        reorder_level: parseInt(formData.reorder_level, 10) || 10,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {item ? 'Modify Product SKU' : 'Register New ERP Product Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Product / Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Industrial Water Chiller 10-Ton"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                required
                disabled={!!item}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bakery Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Pastries & Viennoiserie">🥐 Pastries & Viennoiserie</option>
                <option value="Cakes & Cheesecakes">🍰 Cakes & Cheesecakes</option>
                <option value="Artisan Breads">🥖 Artisan Breads & Sourdough</option>
                <option value="Bakery Ingredients">🧈 Bakery Ingredients (Butter/Flour)</option>
                <option value="Packaging">📦 Bakery Packaging & Boxes</option>
                <option value="Beverages">☕ Coffee & Beverages</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit of Measure (UOM)
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="SLICE">SLICE (Cake Slice)</option>
                <option value="LOAF">LOAF (Bread Loaf)</option>
                <option value="BOX">BOX (Pack / Display)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="BAG">BAG (e.g. 25kg/50kg)</option>
                <option value="UNIT">UNIT</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Safety Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Product Image URL (Azure Blob Storage)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="https://db2backup1.blob.core.windows.net/assets/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
                {formData.image_url && (
                  <div className="w-9 h-9 rounded-lg border border-slate-300 overflow-hidden shrink-0 bg-slate-100">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Quick Azure Presets:</span>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    name: formData.name || 'Artisan French Butter Croissant',
                    category: 'Pastries & Viennoiserie',
                    image_url: 'https://db2backup1.blob.core.windows.net/assets/Homemade-Croissants-1.jpg'
                  })}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium transition-colors"
                >
                  🥐 Croissant
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    name: formData.name || 'Basque Burnt Cheesecake (Slice)',
                    category: 'Cakes & Cheesecakes',
                    image_url: 'https://db2backup1.blob.core.windows.net/assets/brunt-cheesecake.jpg'
                  })}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100 font-medium transition-colors"
                >
                  🍰 Burnt Cheesecake
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Item Description / Recipe Notes
              </label>
              <textarea
                rows="2"
                placeholder="Fresh ingredients, baking temperature, allergen warnings..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : item ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
