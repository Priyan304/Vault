import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { Resource } from '../types';

interface CodeSnippetsViewProps {
  snippets: Resource[];
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateSnippet: () => void;
}

export const CodeSnippetsView: React.FC<CodeSnippetsViewProps> = ({
  snippets,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenCreateSnippet,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique languages
  const languages = Array.from(
    new Set(snippets.map((s) => s.language || 'generic').filter(Boolean))
  );

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch =
      !search.trim() ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.content && s.content.toLowerCase().includes(search.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

    const matchesLanguage =
      selectedLanguage === 'All' ||
      (s.language || 'generic').toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#A1A1A1]">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Code Snippets Library
              </h2>
              <p className="text-xs text-[#666]">
                Tested snippets, algorithms, Docker files, configs, and shell utilities
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-create-snippet"
          onClick={onOpenCreateSnippet}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Snippet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#666] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code content or title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
          />
        </div>

        {/* Language Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLanguage('All')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 ${
              selectedLanguage === 'All'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-[#1A1A1A] text-[#666] hover:text-[#A1A1A1] border border-[#262626]'
            }`}
          >
            All Languages
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors uppercase shrink-0 ${
                selectedLanguage === lang
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-[#1A1A1A] text-[#666] hover:text-[#A1A1A1] border border-[#262626]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Grid */}
      {filteredSnippets.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#262626] bg-[#111]">
          <Code2 className="w-8 h-8 text-[#666] mx-auto mb-3" />
          <h4 className="text-sm font-medium text-white">No code snippets found</h4>
          <p className="text-xs text-[#666] mt-1 mb-4">
            Save boilerplates, CLI commands, SQL queries, and reusable functions here.
          </p>
          <button
            onClick={onOpenCreateSnippet}
            className="px-4 py-2 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors"
          >
            + Create First Snippet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSnippets.map((snippet) => {
            const lineCount = (snippet.content || '').split('\n').length;
            const isCopied = copiedId === snippet.id;

            return (
              <div
                key={snippet.id}
                className="group flex flex-col rounded-xl border border-[#262626] bg-[#111] overflow-hidden hover:border-[#333] transition-all shadow-sm"
              >
                {/* Header */}
                <div className="p-4 border-b border-[#262626] flex items-center justify-between gap-3 bg-[#151515]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#1A1A1A] text-[#A1A1A1] border border-[#333]">
                        {snippet.language || 'code'}
                      </span>
                      <span className="text-[10px] font-mono text-[#666]">
                        {lineCount} lines
                      </span>
                    </div>
                    <h3
                      onClick={() => onOpenDetails(snippet)}
                      className="text-sm font-medium text-white truncate cursor-pointer hover:underline transition-colors"
                    >
                      {snippet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(snippet.id, snippet.content || '')}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-[#1A1A1A] border border-[#262626] hover:border-[#333] text-[#A1A1A1] hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onToggleFavorite(snippet.id)}
                      className={`p-1.5 rounded border border-[#262626] bg-[#1A1A1A] hover:bg-[#222] transition-colors ${
                        snippet.is_favorite ? 'text-amber-400' : 'text-[#666] hover:text-white'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          snippet.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => onEdit(snippet)}
                      className="p-1.5 rounded border border-[#262626] bg-[#1A1A1A] text-[#666] hover:text-white hover:bg-[#222] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(snippet.id)}
                      className="p-1.5 rounded border border-[#262626] bg-[#1A1A1A] text-[#666] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description if present */}
                {snippet.description && (
                  <p className="px-4 py-2 text-xs text-[#666] border-b border-[#262626] bg-[#111] line-clamp-2">
                    {snippet.description}
                  </p>
                )}

                {/* Code Body */}
                <div
                  onClick={() => onOpenDetails(snippet)}
                  className="p-4 bg-[#0A0A0A] font-mono text-xs text-[#EDEDED] overflow-x-auto max-h-56 cursor-pointer select-text"
                >
                  <pre>
                    <code>{snippet.content}</code>
                  </pre>
                </div>

                {/* Footer with Tags */}
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-[#262626] bg-[#111] flex flex-wrap gap-1.5">
                    {snippet.tags.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]"
                      >
                        #{t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
