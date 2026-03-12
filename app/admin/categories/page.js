'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import '../dashboard/dashboard.css'; // Reuse some layout styles

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.error(error);
      setError('Failed to load categories');
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAdding(true);
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCatName.trim() }])
      .select();

    setIsAdding(false);
    if (error) {
      setError(error.message);
    } else {
      setNewCatName('');
      setCategories([...categories, data[0]]);
    }
  }

  async function handleDeleteCategory(id) {
    const confirmation = window.confirm('Are you sure you want to delete this category? Products might be affected.');
    if (!confirmation) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert(`Error deleting category: ${error.message}`);
    } else {
      setCategories(categories.filter(c => c.id !== id));
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Categories</h1>
            <div className="admin-nav" style={{ marginTop: '0.5rem' }}>
              <Link href="/admin/dashboard" className="nav-link">&larr; Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <Card style={{ padding: '2rem' }}>
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Household Items"
                error={error}
              />
            </div>
            <Button type="submit" disabled={isAdding || !newCatName.trim()}>
              {isAdding ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </Card>

        <Card style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <h3>Current Categories ({categories.length})</h3>
          {isLoading ? (
            <p>Loading...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
              {categories.map(cat => (
                <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <Button variant="danger" onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
