import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <p>&copy; {new Date().getFullYear()} VegaMart. All rights reserved.</p>
        <p className="footer-subtext">Delivering fresh groceries to your doorstep.</p>
      </div>
    </footer>
  );
}
