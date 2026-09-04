import React, { useState } from 'react';
import {
  Code2,
  Database,
  Shield,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { login, signup } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (authMode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to sign in');
      } else {
        onEnterApp();
      }
    } else {
      const res = await signup(email, password, displayName);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      } else {
        onEnterApp();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] flex flex-col justify-between selection:bg-[#262626]">
      {/* Top Navbar */}
      <header className="border-b border-[#262626] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black shadow-sm font-bold">
            <Shield className="w-4 h-4 fill-black text-black" />
          </div>
          <span className="font-bold tracking-tight text-base text-white">VAULT</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#888] px-3 py-1 rounded-full border border-[#262626] bg-[#111]">
            Local-first & Private
          </span>
        </div>
      </header>

      {/* Hero & Auth Card Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-6xl mx-auto w-full">
        {/* Left Column: Product Value Proposition */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#111] border border-[#262626] text-[#A1A1A1]">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Personal Knowledge & Resource Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Everything worth remembering, <br className="hidden sm:inline" />
            <span className="text-[#A1A1A1]">in one private place.</span>
          </h1>

          <p className="text-sm text-[#A1A1A1] max-w-lg leading-relaxed">
            Stop losing valuable documentation, code snippets, articles, and notes across browser tabs and discord chats. Vault is your clean, searchable personal knowledge repository.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-[#262626] bg-[#111] text-left">
              <Code2 className="w-4 h-4 text-[#A1A1A1] mb-1.5" />
              <div className="text-xs font-semibold text-white">Code Snippets</div>
              <div className="text-[11px] text-[#666]">1-click copy & syntax</div>
            </div>
            <div className="p-3 rounded-xl border border-[#262626] bg-[#111] text-left">
              <StickyNote className="w-4 h-4 text-[#A1A1A1] mb-1.5" />
              <div className="text-xs font-semibold text-white">Markdown Notes</div>
              <div className="text-[11px] text-[#666]">Fast personal docs</div>
            </div>
            <div className="p-3 rounded-xl border border-[#262626] bg-[#111] text-left">
              <Database className="w-4 h-4 text-[#A1A1A1] mb-1.5" />
              <div className="text-xs font-semibold text-white">PostgreSQL & RLS</div>
              <div className="text-[11px] text-[#666]">Ownership security</div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-[#262626] bg-[#111] p-6 shadow-2xl space-y-5">
            {/* Tab switch: Login vs Signup */}
            <div className="flex rounded-lg bg-[#0A0A0A] p-1 border border-[#262626]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  authMode === 'login'
                    ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-xs'
                    : 'text-[#666] hover:text-[#A1A1A1]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  authMode === 'signup'
                    ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-xs'
                    : 'text-[#666] hover:text-[#A1A1A1]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-[#666] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-[#666] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#666] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444] font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] shadow-sm transition-all"
              >
                {authMode === 'login' ? 'Sign In to Vault' : 'Create My Private Vault'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] py-6 px-6 text-center text-xs text-[#666] font-mono">
        Vault — Personal Knowledge & Resource Management Platform
      </footer>
    </div>
  );
};
