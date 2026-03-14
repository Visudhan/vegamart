'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import './Footer.css';

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname && pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="footer">
      <div className="container footer-container">
        <p>&copy; {new Date().getFullYear()} VegaMart. All rights reserved.</p>
        <p className="footer-subtext">Delivering fresh groceries to your doorstep.</p>
      </div>
    </footer>
  );
}
