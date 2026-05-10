import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Request failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow sm:rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending || !email || !password}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-indigo-600 hover:underline">
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
