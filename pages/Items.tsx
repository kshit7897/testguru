
import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Modal, Select } from '../components/ui/Common';
import { Plus, Search, Edit2, Trash2, Loader2, Package, AlertCircle, X, Tag } from 'lucide-react';
import { Item } from '../types';
import { api } from '../lib/api';

export const Items = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '', hsn: '', unit: 'PCS', purchaseRate: 0, saleRate: 0, taxPercent: 18, stock: 0
  });

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.items.list();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load inventory items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', hsn: '', unit: 'PCS', purchaseRate: 0, saleRate: 0, taxPercent: 18, stock: 0 });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if(!formData.name) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (editingId) {
        await api.items.update({ ...formData, id: editingId } as Item);
      } else {
        await api.items.add(formData as Item);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', hsn: '', unit: 'PCS', purchaseRate: 0, saleRate: 0, taxPercent: 18, stock: 0 });
      await loadItems();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this item?')) {
      setIsLoading(true);
      try {
        await api.items.delete(id);
        await loadItems();
      } catch (err: any) {
        setError(err.message || "Failed to delete item.");
        setIsLoading(false);
      }
    }
  };

  // Filtering Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.hsn && item.hsn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unitOptions = [
    {label: 'PCS (Pieces)', value: 'PCS'},
    {label: 'KG (Kilograms)', value: 'KG'},
    {label: 'BOX (Boxes)', value: 'BOX'},
    {label: 'BAG (Bags)', value: 'BAG'},
    {label: 'TON (Tons)', value: 'TON'},
    {label: 'LTR (Liters)', value: 'LTR'},
    {label: 'MTR (Meters)', value: 'MTR'},
    {label: 'DOZ (Dozens)', value: 'DOZ'},
    {label: 'BDL (Bundles)', value: 'BDL'},
    {label: 'SQFT (Sq. Feet)', value: 'SQFT'},
    {label: 'PKT (Packets)', value: 'PKT'},
    {label: 'SET (Sets)', value: 'SET'}
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Package className="h-6 w-6 text-blue-600" />
             Product Master
           </h1>
           <p className="text-sm text-slate-500">Manage your product list, prices and stock.</p>
        </div>
        <Button onClick={openNewModal} icon={Plus}>Add Product</Button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search items by name or HSN..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && items.length === 0 ? (
         <div className="text-center py-12 text-slate-500">
             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
             Loading Inventory...
         </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            {items.length === 0 ? "No items found. Add your first product." : "No matching items found."}
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: TABLE */}
          <div className="hidden md:block">
            <Table headers={['Item Name', 'Unit', 'Purchase Price', 'Sale Price', 'Stock', 'Action']}>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.name}
                    <div className="text-xs text-slate-400">HSN: {item.hsn || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.unit}</td>
                  <td className="px-4 py-3 text-right">₹ {item.purchaseRate}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹ {item.saleRate}</td>
                  <td className="px-4 py-3 text-right">{item.stock}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          {/* MOBILE VIEW: CARDS */}
          <div className="md:hidden space-y-3">
             {filteredItems.map(item => (
               <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                       <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                         <Tag className="h-3 w-3" /> HSN: {item.hsn || 'N/A'}
                       </p>
                     </div>
                     <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">₹ {item.saleRate}</div>
                        <div className="text-[10px] text-slate-400">Sale Rate</div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-50 my-2">
                     <div className="text-center border-r border-slate-50">
                        <span className="block text-xs text-slate-400 uppercase">Purchase</span>
                        <span className="font-medium text-slate-700">₹ {item.purchaseRate}</span>
                     </div>
                     <div className="text-center">
                        <span className="block text-xs text-slate-400 uppercase">Current Stock</span>
                        <span className={`font-medium ${item.stock < 10 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                           {item.stock} {item.unit}
                        </span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <Button variant="secondary" size="sm" onClick={() => handleEdit(item)} className="flex-1">
                        <Edit2 className="h-3 w-3 mr-2" /> Edit
                     </Button>
                     <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} className="flex-1">
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                     </Button>
                  </div>
               </div>
             ))}
          </div>
        </>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Product" : "Add New Product"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Item'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Item Name" 
            placeholder="Product Name" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="HSN Code" 
              placeholder="Optional" 
              value={formData.hsn}
              onChange={e => setFormData({...formData, hsn: e.target.value})}
            />
            <Select 
              label="Unit" 
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
              options={unitOptions} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Purchase Price" 
              type="number" 
              placeholder="0.00" 
              value={formData.purchaseRate}
              onChange={e => setFormData({...formData, purchaseRate: parseFloat(e.target.value)})}
            />
            <Input 
              label="Sale Price" 
              type="number" 
              placeholder="0.00" 
              value={formData.saleRate}
              onChange={e => setFormData({...formData, saleRate: parseFloat(e.target.value)})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Tax Rate (%)" 
              type="number" 
              placeholder="18" 
              value={formData.taxPercent}
              onChange={e => setFormData({...formData, taxPercent: parseFloat(e.target.value)})}
            />
            <Input 
              label="Opening Stock" 
              type="number" 
              placeholder="0" 
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
