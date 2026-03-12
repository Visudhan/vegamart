'use client';

import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import './CheckoutForm.css';

export default function CheckoutForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <Input 
        label="Full Name" 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
        error={errors.name}
        placeholder="e.g. Rahul Kumar"
      />
      <Input 
        type="tel"
        label="Phone Number" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        error={errors.phone}
        placeholder="e.g. 9876543210"
      />
      <div className="input-group">
        <label className="input-label">Delivery Address</label>
        <textarea 
          className={`input-field address-field ${errors.address ? 'input-error' : ''}`}
          name="address" 
          value={formData.address} 
          onChange={handleChange} 
          placeholder="e.g. Flat 101, XYZ Apartments, Main Street"
          rows="3"
        ></textarea>
        {errors.address && <span className="input-error-msg">{errors.address}</span>}
      </div>

      <div className="input-group">
        <label className="input-label">Payment Method</label>
        <select 
          className="input-field" 
          name="paymentMethod" 
          value={formData.paymentMethod} 
          onChange={handleChange}
        >
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="UPI">UPI (Pay after confirmation)</option>
        </select>
      </div>

      <div className="checkout-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </form>
  );
}
