// src/pages/AdminSetup.tsx
// TEMPORARY PAGE - Use this once to set admin role, then delete this file

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, setUserRole, getUserRole } from '../firebase';

export default function AdminSetup() {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const role = await getUserRole(u.uid);
          setCurrentRole(role);
        } catch (error) {
          console.error('Error getting role:', error);
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleSetAdmin = async () => {
    if (!user) {
      setMessage('❌ Please sign in first!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await setUserRole(user.uid, 'admin');
      setMessage('✅ Successfully set as admin! You can now log in to admin portal.');
      setCurrentRole('admin');
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error setting admin role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetStudent = async () => {
    if (!user) {
      setMessage('❌ Please sign in first!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await setUserRole(user.uid, 'student');
      setMessage('✅ Successfully set as student!');
      setCurrentRole('student');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error setting student role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDriver = async () => {
    if (!user) {
      setMessage('❌ Please sign in first!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await setUserRole(user.uid, 'driver');
      setMessage('✅ Successfully set as driver!');
      setCurrentRole('driver');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error setting driver role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <h2 className="text-2xl font-bold mb-4">Admin Setup</h2>
          <p className="text-red-600 mb-4">
            Please sign in first, then come back to this page.
          </p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-md w-full p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🔧 Admin Setup Tool
        </h2>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Signed in as:</strong>
            <br />
            {user.email}
            <br />
            <strong>User ID:</strong> {user.uid}
            <br />
            <strong>Current Role:</strong>{' '}
            <span className="font-bold text-lg">
              {currentRole || 'No role set'}
            </span>
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 text-sm rounded-lg ${
              message.includes('✅')
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleSetAdmin}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Setting...' : '🔐 Set as ADMIN'}
          </Button>

          <Button
            onClick={handleSetDriver}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Setting...' : '🚗 Set as DRIVER'}
          </Button>

          <Button
            onClick={handleSetStudent}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Setting...' : '🎓 Set as STUDENT'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Important:</strong> After setting the role, delete this
            file (AdminSetup.tsx) for security. This is only for initial setup.
          </p>
        </div>
      </Card>
    </div>
  );
}