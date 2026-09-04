import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  Lock,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Resource } from '../types';

interface DiaryViewProps {
  entries: Resource[];
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateDiary: () => void;
}

const MOODS = [
  { label: 'Focused', emoji: '⚡' },
  { label: 'Inspired', emoji: '✨' },
  { label: 'Productive', emoji: '🚀' },
  { label: 'Calm', emoji: '🌿' },
  { label: 'Thoughtful', emoji: '🧠' },
  { label: 'Reflective', emoji: '☕' },
];

export const DiaryView: React.FC<DiaryViewProps> = ({
  entries,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenCreateDiary,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | 'All'>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Resource | null>(entries[0] || null);

  // Keep selectedEntry in sync if entries change
  React.useEffect(() => {
    if (!selectedEntry && entries.length > 0) {
      setSelectedEntry(entries[0]);
    } else if (selectedEntry) {
      const refreshed = entries.find((e) => e.id === selectedEntry.id);
      if (refreshed) setSelectedEntry(refreshed);
      else setSelectedEntry(entries[0] || null);
    }
  }, [entries]);

  const filteredEntries = entries.filter((e) => {
    if (favoritesOnly && !e.is_favorite) return false;
    if (selectedMood !== 'All' && e.mood !== selectedMood) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.content && e.content.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.mood && e.mood.toLowerCase().includes(q)) ||
      (e.tags && e.tags.some((t) => t.name.toLowerCase().includes(q)))
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getWordCount = (text?: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getReadingTime = (words: number) => {
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Digital Diary</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <p className="text-xs text-[#666]">
                Private daily reflections, milestones, and personal thoughts with Row Level Security
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-create-diary-entry"
          onClick={onOpenCreateDiary}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Diary Entry</span>
        </button>
      </div>

      {/* Quick Check-in Banner */}
      <div className="rounded-xl border border-[#262626] bg-[#111] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1A1]">
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <p className="text-sm text-[#EDEDED] font-medium">
            Take a moment to record what you built, learned, or experienced today.
          </p>
        </div>
        <button
          onClick={onOpenCreateDiary}
          className="px-3.5 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-xs font-medium text-white transition-colors flex items-center gap-2 shrink-0"
        >
          <Pencil className="w-3.5 h-3.5 text-[#A1A1A1]" />
          <span>Write Today's Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diary entries, reflections, or tags..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#262626] bg-[#111] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mood Chips & Favorite Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedMood('All')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              selectedMood === 'All'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#111] text-[#A1A1A1] border border-[#262626] hover:text-white'
            }`}
          >
            All Moods
          </button>
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setSelectedMood(isSelected ? 'All' : m.label)}
                className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#111] text-[#A1A1A1] border border-[#262626] hover:text-white'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              favoritesOnly
                ? 'bg-white text-black font-semibold'
                : 'bg-[#111] text-[#A1A1A1] border border-[#262626] hover:text-white'
            }`}
          >
            <Star className={`w-3 h-3 ${favoritesOnly ? 'fill-black' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Timeline List & Reading Pane */}
      {entries.length === 0 ? (
        <div className="py-20 text-center rounded-xl border border-dashed border-[#262626] bg-[#111] space-y-3">
          <BookOpen className="w-8 h-8 text-[#666] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No diary entries yet</h3>
          <p className="text-xs text-[#666] max-w-sm mx-auto">
            Your digital diary is completely private. Use it to record daily progress, technical insights, or personal reflections.
          </p>
          <button
            onClick={onOpenCreateDiary}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write First Diary Entry</span>
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-[#262626] bg-[#111]">
          <p className="text-xs text-[#666]">No entries matched your search or mood filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedMood('All');
              setFavoritesOnly(false);
            }}
            className="mt-2 text-xs text-white hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Entries List */}
          <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredEntries.map((entry) => {
              const isSelected = selectedEntry?.id === entry.id;
              const words = getWordCount(entry.content);

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-white bg-[#1A1A1A] shadow-md'
                      : 'border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A1A1A1]">
                        {formatDate(entry.created_at)}
                      </span>
                      <span className="text-[10px] font-mono text-[#666]">
                        {formatTime(entry.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {entry.mood && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-white border border-[#262626]">
                          {entry.mood}
                        </span>
                      )}
                      {entry.is_favorite && (
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                      )}
                      <span title="Private Entry">
                        <Lock className="w-3 h-3 text-[#666]" />
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-1">
                    {entry.title}
                  </h3>

                  {entry.description && (
                    <p className="text-xs text-[#A1A1A1] line-clamp-2 mb-2.5">
                      {entry.description}
                    </p>
                  )}

                  {!entry.description && entry.content && (
                    <p className="text-xs text-[#888] line-clamp-2 mb-2.5">
                      {entry.content.replace(/[#*`_]/g, '')}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#666] pt-2 border-t border-[#262626]/60">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#666]" />
                      <span>{getReadingTime(words)}</span>
                      <span>•</span>
                      <span>{words} words</span>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {entry.tags.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Entry Reader */}
          <div className="lg:col-span-7">
            {selectedEntry ? (
              <div className="rounded-xl border border-[#262626] bg-[#111] overflow-hidden flex flex-col shadow-2xl">
                {/* Entry Header */}
                <div className="p-6 border-b border-[#262626] bg-[#141414] space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#333]">
                        {formatDate(selectedEntry.created_at)}
                      </span>
                      <span className="text-xs font-mono text-[#666]">
                        {formatTime(selectedEntry.created_at)}
                      </span>
                      {selectedEntry.mood && (
                        <span className="text-xs font-mono text-[#EDEDED] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#262626]">
                          Mood: {selectedEntry.mood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(selectedEntry.id)}
                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                        title={selectedEntry.is_favorite ? 'Remove favorite' : 'Mark favorite'}
                      >
                        <Star className={`w-4 h-4 ${selectedEntry.is_favorite ? 'fill-white text-white' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopy(selectedEntry.id, selectedEntry.content || selectedEntry.title)}
                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                        title="Copy entry content"
                      >
                        {copiedId === selectedEntry.id ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onEdit(selectedEntry)}
                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                        title="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(selectedEntry.id)}
                        className="p-1.5 rounded text-[#666] hover:text-rose-400 hover:bg-[#1A1A1A] transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {selectedEntry.title}
                  </h1>

                  {selectedEntry.description && (
                    <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
                      {selectedEntry.description}
                    </p>
                  )}

                  {/* Metadata and Tags */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#666]">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Private & Encrypted with RLS</span>
                    </div>
                    <span>•</span>
                    <div>{getWordCount(selectedEntry.content)} words</div>
                    <span>•</span>
                    <div>{getReadingTime(getWordCount(selectedEntry.content))}</div>

                    {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          {selectedEntry.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#EDEDED] border border-[#262626]"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Entry Content Body */}
                <div className="p-6 sm:p-8 min-h-[350px] max-h-[60vh] overflow-y-auto bg-[#111]">
                  {selectedEntry.content ? (
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[#EDEDED] space-y-4">
                      <Markdown>{selectedEntry.content}</Markdown>
                    </div>
                  ) : (
                    <div className="text-xs text-[#666] italic">
                      No text body in this entry. Click edit to add your thoughts.
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-3 border-t border-[#262626] bg-[#0A0A0A] flex items-center justify-between text-xs text-[#666]">
                  <span className="font-mono text-[11px]">Vault Digital Diary</span>
                  <button
                    onClick={() => onOpenDetails(selectedEntry)}
                    className="text-white hover:underline text-xs"
                  >
                    Open in Full Inspector →
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-xl border border-[#262626] bg-[#111] text-[#666] text-xs">
                Select an entry on the left to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
