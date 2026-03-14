'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Card from '@/components/ui/Card';
import './dashboard.css';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const [productsRes, ordersRes, pendingRes, lowStockRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
          supabase.from('products').select('*').lte('stock', 5).order('stock', { ascending: true }).limit(5)
        ]);

        setStats({
          totalProducts: productsRes.count || 0,
          totalOrders: ordersRes.count || 0,
          pendingOrders: pendingRes.count || 0,
          lowStockItems: lowStockRes.data || []
        });
      } catch (error) {
        console.error("Error fetching admin stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.next !== passForm.confirm) {
        return setPassError('New passwords do not match');
    }

    setIsChangingPass(true);
    try {
        const res = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: passForm.current,
                newPassword: passForm.next
            })
        });

        const data = await res.json();
        if (res.ok) {
            setPassSuccess('Password updated successfully!');
            setPassForm({ current: '', next: '', confirm: '' });
            setTimeout(() => setIsPassModalOpen(false), 2000);
        } else {
            setPassError(data.message || 'Failed to update password');
        }
    } catch (err) {
        setPassError('Something went wrong');
    } finally {
        setIsChangingPass(false);
    }
  };

  if (isLoading) {
    return <div className="admin-loading">Loading Dashboard Data...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <div className="admin-nav" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin/products" className="nav-link">Products</Link>
          <Link href="/admin/categories" className="nav-link">Categories</Link>
          <Link href="/admin/orders" className="nav-link">Orders</Link>
          <button 
            className="nav-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--text-secondary)' }}
            onClick={() => setIsPassModalOpen(true)}
          >
            Change Password
          </button>
        </div>
      </header>

      <div className="stat-cards">
        <Card className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{stats.totalProducts}</div>
        </Card>
        <Card className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.totalOrders}</div>
        </Card>
        <Card className="stat-card highlight">
          <h3>Pending Orders</h3>
          <div className="stat-value">{stats.pendingOrders}</div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card className="alert-card">
          <div className="card-header">
            <h2 className="alert-title">Low Stock Alerts</h2>
            <Link href="/admin/products" className="view-all-link">Manage Stock</Link>
          </div>
          {stats.lowStockItems.length === 0 ? (
            <p className="no-alerts">All products are sufficiently stocked!</p>
          ) : (
            <ul className="alert-list">
              {stats.lowStockItems.map(item => (
                <li key={item.id} className="alert-item">
                  <span className="item-name">{item.name}</span>
                  <span className={`item-stock ${item.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                    {item.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal 
        isOpen={isPassModalOpen} 
        onClose={() => setIsPassModalOpen(false)} 
        title="Change Admin Password"
      >
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {passError && <div style={{ color: 'var(--error-color)', fontSize: '0.9rem' }}>{passError}</div>}
          {passSuccess && <div style={{ color: 'var(--success-color)', fontSize: '0.9rem' }}>{passSuccess}</div>}
          
          <Input 
            label="Current Password" 
            type="password" 
            required 
            value={passForm.current} 
            onChange={e => setPassForm({ ...passForm, current: e.target.value })} 
          />
          <Input 
            label="New Password" 
            type="password" 
            required 
            value={passForm.next} 
            onChange={e => setPassForm({ ...passForm, next: e.target.value })} 
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            required 
            value={passForm.confirm} 
            onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsPassModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isChangingPass}>
              {isChangingPass ? 'Changing...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
