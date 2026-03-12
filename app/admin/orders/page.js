'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Card from '@/components/ui/Card';
import '../dashboard/dashboard.css';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    // Fetch orders with their items and related products
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          products (name, price)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  }

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert(`Could not update status: ${error.message}`);
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Preparing': return 'status-preparing';
      case 'Delivered': return 'status-delivered';
      default: return '';
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Orders</h1>
            <div className="admin-nav" style={{ marginTop: '0.5rem' }}>
              <Link href="/admin/dashboard" className="nav-link">&larr; Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <Card style={{ padding: '0', overflowX: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Order ID & Date</th>
                  <th style={{ padding: '1rem' }}>Customer Details</th>
                  <th style={{ padding: '1rem' }}>Items</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const total = order.order_items?.reduce((sum, item) => sum + (item.quantity * item.products.price), 0);
                  
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          {order.id.split('-')[0]}
                        </div>
                        <div style={{ fontWeight: 500 }}>
                          {new Date(order.created_at).toLocaleDateString()}
                          <br />
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.9rem' }}>{order.phone}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{order.address}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem' }}>
                          {order.order_items?.map((item, idx) => (
                            <li key={idx}>
                              {item.quantity}x {item.products.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        ₹{total}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
