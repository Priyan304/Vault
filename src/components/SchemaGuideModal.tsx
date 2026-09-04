import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Layers,
  ShieldCheck,
  Table,
  X,
} from 'lucide-react';
import { POSTGRES_SCHEMA_SQL, db } from '../lib/storage';

interface SchemaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaGuideModal: React.FC<SchemaGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'tables' | 'rls' | 'steps'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawTables = db.getRawTables();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="schema-guide-dialog"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-[#262626] bg-[#111] shadow-2xl text-[#EDEDED] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#A1A1A1]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Database Architecture & Learning Guide
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]">
                  PostgreSQL & Supabase
                </span>
              </h2>
              <p className="text-xs text-[#666]">
                Understand the 4 relational tables, many-to-many relationships, and Row Level Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-[#262626] bg-[#0A0A0A]">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-sm'
                : 'text-[#666] hover:text-[#A1A1A1]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            PostgreSQL DDL & Schema
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-sm'
                : 'text-[#666] hover:text-[#A1A1A1]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Live Table Inspector
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'rls'
                ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-sm'
                : 'text-[#666] hover:text-[#A1A1A1]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Row Level Security (RLS)
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'bg-[#1A1A1A] border border-[#333] text-white font-semibold shadow-sm'
                : 'text-[#666] hover:text-[#A1A1A1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Supabase Connection Steps
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#666]">
                  Ready-to-run SQL definition for Supabase SQL Editor or standard PostgreSQL:
                </p>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>Copied SQL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full DDL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg border border-[#262626] bg-[#0A0A0A] p-4 font-mono text-xs text-[#EDEDED] overflow-x-auto max-h-[55vh]">
                <pre>
                  <code>{POSTGRES_SCHEMA_SQL}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#666] mb-2 flex items-center gap-2">
                  <span>1. \`resources\` table</span>
                  <span className="text-[#555]">({rawTables.resources.length} rows)</span>
                </h3>
                <div className="rounded-lg border border-[#262626] overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#0A0A0A] text-[#666] border-b border-[#262626]">
                      <tr>
                        <th className="p-2.5">id</th>
                        <th className="p-2.5">user_id</th>
                        <th className="p-2.5">title</th>
                        <th className="p-2.5">type</th>
                        <th className="p-2.5">is_favorite</th>
                        <th className="p-2.5">is_public</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-[#EDEDED]">
                      {rawTables.resources.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-[#151515]">
                          <td className="p-2.5 text-[#666]">{r.id}</td>
                          <td className="p-2.5 text-[#666]">{r.user_id}</td>
                          <td className="p-2.5 font-sans font-medium text-white truncate max-w-xs">{r.title}</td>
                          <td className="p-2.5 text-[#A1A1A1]">{r.type}</td>
                          <td className="p-2.5 text-[#A1A1A1]">{r.is_favorite ? 'true' : 'false'}</td>
                          <td className="p-2.5 text-[#A1A1A1]">{r.is_public ? 'true' : 'false'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#666] mb-2 flex items-center gap-2">
                  <span>2. \`tags\` table</span>
                  <span className="text-[#555]">({rawTables.tags.length} rows)</span>
                </h3>
                <div className="rounded-lg border border-[#262626] overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#0A0A0A] text-[#666] border-b border-[#262626]">
                      <tr>
                        <th className="p-2.5">id</th>
                        <th className="p-2.5">user_id</th>
                        <th className="p-2.5">name</th>
                        <th className="p-2.5">created_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-[#EDEDED]">
                      {rawTables.tags.map((t) => (
                        <tr key={t.id} className="hover:bg-[#151515]">
                          <td className="p-2.5 text-[#666]">{t.id}</td>
                          <td className="p-2.5 text-[#666]">{t.user_id}</td>
                          <td className="p-2.5 text-white">#{t.name}</td>
                          <td className="p-2.5 text-[#666]">{t.created_at.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#666] mb-2 flex items-center gap-2">
                  <span>3. \`resource_tags\` join table (Many-to-Many)</span>
                  <span className="text-[#555]">({rawTables.resource_tags.length} associations)</span>
                </h3>
                <div className="rounded-lg border border-[#262626] overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#0A0A0A] text-[#666] border-b border-[#262626]">
                      <tr>
                        <th className="p-2.5">resource_id</th>
                        <th className="p-2.5">tag_id</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-[#EDEDED]">
                      {rawTables.resource_tags.slice(0, 6).map((rt, idx) => (
                        <tr key={idx} className="hover:bg-[#151515]">
                          <td className="p-2.5 text-[#666]">{rt.resource_id}</td>
                          <td className="p-2.5 text-[#666]">{rt.tag_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-4 leading-relaxed text-[#EDEDED]">
              <div className="p-4 rounded-lg border border-[#262626] bg-[#1A1A1A] text-[#EDEDED] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-white" />
                <div>
                  <h4 className="font-semibold text-white">How Row Level Security (RLS) Works in Vault</h4>
                  <p className="text-xs text-[#A1A1A1] mt-1">
                    Without RLS, any connected client could query <code>SELECT * FROM resources</code> and read other users' private notes and links. With RLS enabled, PostgreSQL automatically evaluates security policies on every query.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#666]">Core Policies Explained:</h4>
                <div className="p-3.5 rounded-lg border border-[#262626] bg-[#0A0A0A] space-y-2 font-mono text-xs">
                  <div className="text-white">-- 1. Read Policy (Select)</div>
                  <div className="text-[#A1A1A1]">
                    USING (auth.uid() = user_id OR is_public = true);
                  </div>
                  <div className="text-[#666] font-sans text-xs">
                    Allows users to view their own private items, as well as any resource marked as public by other users.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262626] bg-[#0A0A0A] space-y-2 font-mono text-xs">
                  <div className="text-white">-- 2. Insert Policy</div>
                  <div className="text-[#A1A1A1]">
                    WITH CHECK (auth.uid() = user_id);
                  </div>
                  <div className="text-[#666] font-sans text-xs">
                    Prevents a user from inserting a resource with another user's ID.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262626] bg-[#0A0A0A] space-y-2 font-mono text-xs">
                  <div className="text-white">-- 3. Delete & Update Policies</div>
                  <div className="text-[#A1A1A1]">
                    USING (auth.uid() = user_id);
                  </div>
                  <div className="text-[#666] font-sans text-xs">
                    Only the owner of the resource can mutate or delete it, regardless of whether it was marked public.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4 text-[#EDEDED] leading-relaxed">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Next Steps to Connect Real Supabase:</h4>
              <ol className="list-decimal list-inside space-y-3 text-xs text-[#A1A1A1]">
                <li className="p-3 rounded-lg border border-[#262626] bg-[#1A1A1A]">
                  <strong className="text-white">Create a Supabase Project:</strong> Go to{' '}
                  <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-white underline">
                    supabase.com
                  </a>{' '}
                  and click "New Project".
                </li>
                <li className="p-3 rounded-lg border border-[#262626] bg-[#1A1A1A]">
                  <strong className="text-white">Run the SQL Migration:</strong> Open the SQL Editor in Supabase, paste the SQL from the first tab, and click <em>Run</em>.
                </li>
                <li className="p-3 rounded-lg border border-[#262626] bg-[#1A1A1A]">
                  <strong className="text-white">Add Environment Variables:</strong> Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file.
                </li>
                <li className="p-3 rounded-lg border border-[#262626] bg-[#1A1A1A]">
                  <strong className="text-white">Enable Email Auth:</strong> In Supabase Authentication settings, confirm Email/Password provider is enabled.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
