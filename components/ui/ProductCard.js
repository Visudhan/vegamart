/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAddToCart({ ...product, quantity });
      setQuantity(1); // reset after adding
    }
  };

  const unit = product.category?.name === 'Vegetables' || product.category?.name === 'Fruits' ? 'kg' : 'pc';

  return (
    <Card className="product-card">
      <div className="product-image-container">
        {/* Placeholder image representation */}
        <div className="product-image-placeholder">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-image" />
          ) : (
            <span>{product.name[0]}</span>
          )}
        </div>
        {isOutOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
        <div className="category-badge">{product.categories?.name}</div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price} / {unit}</p>
        
        <div className="product-actions">
          <div className="quantity-selector">
            <button 
              className="qty-btn" 
              onClick={handleDecrement} 
              disabled={quantity <= 1 || isOutOfStock}
            >
              -
            </button>
            <span className="qty-value">{quantity}</span>
            <button 
              className="qty-btn" 
              onClick={handleIncrement} 
              disabled={quantity >= product.stock || isOutOfStock}
            >
              +
            </button>
          </div>
          
          <Button 
            variant={isOutOfStock ? "secondary" : "primary"}
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="add-to-cart-btn"
          >
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
