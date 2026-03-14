/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import './Header.css';

export default function Header() {
  const { cartCount, toggleCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname && pathname.startsWith('/admin') && pathname !== '/admin/login';
  const logoHref = isAdmin ? '/admin/dashboard' : '/';

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link href={logoHref} className="logo">
          VegaMart
        </Link>
        <div className="header-actions">
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/" className="nav-link" style={{ fontSize: '0.9rem' }}>View Store</Link>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="cart-btn" onClick={toggleCart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Cart 
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
