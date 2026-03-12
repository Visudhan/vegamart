'use client';

import React, { useState } from 'react';
import Cart from '@/components/ui/Cart';
import Modal from '@/components/ui/Modal';
import CheckoutForm from '@/components/ui/CheckoutForm';
import { useCart } from '@/context/CartContext';
import { formatWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';

export default function AppShell({ children }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cartItems, cartTotal, setIsCartOpen, clearCart } = useCart();

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (orderDetails) => {
    setIsSubmitting(true);
    try {
      // 1. Save to database
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails,
          cartItems,
          total: cartTotal
        })
      });
      
      if (!res.ok) throw new Error('Failed to save order');

      // 2. Clear cart and close modal
      clearCart();
      setIsCheckoutOpen(false);
      
      // 3. Open WhatsApp
      const message = formatWhatsAppMessage(orderDetails, cartItems, cartTotal);
      openWhatsApp(message);
      
      alert('Order placed successfully! Redirecting to WhatsApp...');
    } catch (error) {
      console.error(error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {children}
      <Cart onCheckout={handleOpenCheckout} />
      <Modal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        title="Complete Your Order"
      >
        <CheckoutForm 
          onSubmit={handleCheckoutSubmit} 
          onCancel={() => setIsCheckoutOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </>
  );
}
