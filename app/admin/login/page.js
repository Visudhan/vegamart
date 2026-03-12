'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import './login.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="login-title">Admin Access</h1>
        <p className="login-subtitle">Enter your password to manage the store</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <Input 
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            placeholder="Enter admin password"
            autoFocus
          />
          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
