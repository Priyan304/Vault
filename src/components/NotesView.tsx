import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Check,
  Copy,
  Pencil,
  Plus,
  Search,
  Star,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { Resource } from '../types';

interface NotesViewProps {
  notes: Resource[];
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateNote: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenCreateNote,
}) => {
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<Resource | null>(notes[0] || null);
  const [copied, setCopied] = useState(false);

  // Sync selected note if notes update
  React.useEffect(() => {
    if (!selectedNote && notes.length > 0) {
      setSelectedNote(notes[0]);
    } else if (selectedNote) {
      const refreshed = notes.find((n) => n.id === selectedNote.id);
      if (refreshed) setSelectedNote(refreshed);
      else setSelectedNote(notes[0] || null);
    }
  }, [notes]);

  const filteredNotes = notes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some((t) => t.name.toLowerCase().includes(q)))
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (text?: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#A1A1A1]">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Personal Notes</h2>
              <p className="text-xs text-[#666]">
                Markdown-formatted documentation, meeting thoughts, and study logs
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-create-note"
          onClick={onOpenCreateNote}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#262626] bg-[#111]">
          <StickyNote className="w-8 h-8 text-[#666] mx-auto mb-3" />
          <h4 className="text-sm font-medium text-white">No notes written yet</h4>
          <p className="text-xs text-[#666] mt-1 mb-4">
            Capture architectural decisions, learning notes, or quick summaries in Markdown.
          </p>
          <button
            onClick={onOpenCreateNote}
            className="px-4 py-2 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors"
          >
            + Create First Note
          </button>
        </div>
      ) : (
        /* Split view: List on left, Rich viewer on right */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
          {/* Note List Sidebar */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[650px] pr-1">
              {filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#333] bg-[#1A1A1A] text-white shadow-sm'
                        : 'border-[#262626] bg-[#111] hover:bg-[#151515] hover:border-[#333] text-[#A1A1A1]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate text-white">{note.title}</h4>
                      {note.is_favorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    {note.content && (
                      <p className="text-xs text-[#666] line-clamp-2 mb-2 leading-relaxed">
                        {note.content.replace(/^#+\s+/gm, '')}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#555] pt-1.5 border-t border-[#262626]">
                      <span>{wordCount(note.content)} words</span>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Note Preview */}
          <div className="md:col-span-7 rounded-xl border border-[#262626] bg-[#111] flex flex-col overflow-hidden">
            {selectedNote ? (
              <>
                {/* Note Viewer Header */}
                <div className="p-5 border-b border-[#262626] flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {selectedNote.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#666] font-mono">
                      <span>{wordCount(selectedNote.content)} words</span>
                      <span>•</span>
                      <span>Updated {new Date(selectedNote.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(selectedNote.content || selectedNote.title)}
                      className="p-1.5 rounded border border-[#262626] bg-[#1A1A1A] hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                      title="Copy Markdown"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onToggleFavorite(selectedNote.id)}
                      className={`p-1.5 rounded border border-[#262626] bg-[#1A1A1A] hover:bg-[#222] transition-colors ${
                        selectedNote.is_favorite
                          ? 'text-amber-400'
                          : 'text-[#888] hover:text-white'
                      }`}
                      title="Favorite"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          selectedNote.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onEdit(selectedNote)}
                      className="p-1.5 rounded border border-[#262626] bg-[#1A1A1A] hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                      title="Edit note"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(selectedNote.id)}
                      className="p-1.5 rounded border border-[#262626] bg-[#1A1A1A] hover:bg-rose-500/10 text-[#888] hover:text-rose-400 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Markdown Render Body */}
                <div className="flex-1 p-6 overflow-y-auto leading-relaxed text-sm text-[#EDEDED]">
                  {selectedNote.content ? (
                    <div className="space-y-4">
                      <Markdown>{selectedNote.content}</Markdown>
                    </div>
                  ) : (
                    <p className="text-xs text-[#666] italic">No content in this note.</p>
                  )}
                </div>

                {/* Note Footer: Tags */}
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="p-4 border-t border-[#262626] bg-[#0D0D0D] flex items-center gap-2">
                    <span className="text-xs text-[#666] font-mono">Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNote.tags.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]"
                        >
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-[#666] text-xs font-mono">
                Select a note from the left to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
