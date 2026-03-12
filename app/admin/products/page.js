'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import '../dashboard/dashboard.css'; 

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: '',
    image: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('name'),
      supabase.from('categories').select('*').order('name')
    ]);
    
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setIsLoading(false);
  }

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '0', category_id: categories[0]?.id || '', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id,
      image: formData.image || null
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) alert(`Error updating product: ${error.message}`);
      else fetchData();
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) alert(`Error adding product: ${error.message}`);
      else fetchData();
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
  }

  const handleDelete = async (id) => {
    const confirmation = window.confirm('Are you sure you want to delete this product?');
    if (!confirmation) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  }

  const handleQuickStockUpdate = async (id, newStock) => {
    await supabase.from('products').update({ stock: newStock }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Products</h1>
            <div className="admin-nav" style={{ marginTop: '0.5rem' }}>
              <Link href="/admin/dashboard" className="nav-link">&larr; Back to Dashboard</Link>
            </div>
          </div>
          <Button onClick={openAddModal}>+ Add Product</Button>
        </div>
      </header>

      <div className="dashboard-content">
        <Card style={{ padding: '0', overflowX: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>No products found. Add some to get started!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Price (₹)</th>
                  <th style={{ padding: '1rem' }}>Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : product.name[0]}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{product.categories?.name}</td>
                    <td style={{ padding: '1rem' }}>₹{product.price}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="nav-link" style={{ padding: '0.2rem 0.6rem' }} onClick={() => handleQuickStockUpdate(product.id, Math.max(0, product.stock - 1))}>-</button>
                        <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600, color: product.stock <= 0 ? 'var(--error-color)' : 'inherit' }}>{product.stock}</span>
                        <button className="nav-link" style={{ padding: '0.2rem 0.6rem' }} onClick={() => handleQuickStockUpdate(product.id, product.stock + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" onClick={() => openEditModal(product)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(product.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Product Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input label="Price (₹)" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <Input label="Initial Stock" type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field" required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
              <option value="" disabled>Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <Input label="Image URL (Optional)" type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
