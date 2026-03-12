'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Card from '@/components/ui/Card';
import './dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="admin-loading">Loading Dashboard Data...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <div className="admin-nav">
          <Link href="/admin/products" className="nav-link">Products</Link>
          <Link href="/admin/categories" className="nav-link">Categories</Link>
          <Link href="/admin/orders" className="nav-link">Orders</Link>
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
    </div>
  );
}
