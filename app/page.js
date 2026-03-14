'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import SearchBar from '@/components/ui/SearchBar';
import ProductCard from '@/components/ui/ProductCard';
import './page.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(fetchedProducts || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error("Failed to load store data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.categories?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Loading VegaMart...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="hero-section">
        <h1 className="hero-title">Fresh groceries,<br/>delivered to your door.</h1>
        <p className="hero-subtitle">Shop fresh vegetables, fruits, and daily essentials from your local neighborhood store.</p>
        
        <div className="search-wrapper">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search for apples, milk, bread..." 
          />
        </div>
      </section>

      <section className="store-section">
        <div className="category-filters">
          <button 
            className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>We couldn&apos;t find any products matching your search criteria.</p>
            <button className="btn btn-secondary mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
