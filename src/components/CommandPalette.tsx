import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Code2,
  Plus,
  Search,
  Star,
  StickyNote,
  Tag as TagIcon,
} from 'lucide-react';
import { Resource, ResourceType, ViewMode } from '../types';
import { getTypeIcon } from './ResourceCard';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
  onSelectResource: (resource: Resource) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenCreateModal: (type?: ResourceType) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  resources,
  onSelectResource,
  onNavigate,
  onOpenCreateModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResources = query.trim()
    ? resources
        .filter((r) => {
          const q = query.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q) || false;
          const matchTags = r.tags?.some((t) => t.name.toLowerCase().includes(q)) || false;
          return matchTitle || matchDesc || matchTags;
        })
        .slice(0, 8)
    : [];

  const actions = [
    {
      id: 'create-resource',
      label: 'Create New Resource...',
      icon: Plus,
      action: () => onOpenCreateModal(),
    },
    {
      id: 'create-snippet',
      label: 'Save Code Snippet...',
      icon: Code2,
      action: () => onOpenCreateModal('Code Snippet'),
    },
    {
      id: 'create-note',
      label: 'Write New Note...',
      icon: StickyNote,
      action: () => onOpenCreateModal('Note'),
    },
    {
      id: 'create-diary',
      label: 'Write Diary Entry...',
      icon: BookOpen,
      action: () => onOpenCreateModal('Diary'),
    },
    {
      id: 'nav-diary',
      label: 'Go to Digital Diary',
      icon: BookOpen,
      action: () => onNavigate('diary'),
    },
    {
      id: 'nav-favs',
      label: 'View Favorites',
      icon: Star,
      action: () => onNavigate('favorites'),
    },
    {
      id: 'nav-tags',
      label: 'Browse Tags Catalog',
      icon: TagIcon,
      action: () => onNavigate('tags'),
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-box"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-[#262626] bg-[#111] shadow-2xl overflow-hidden text-[#EDEDED] flex flex-col max-h-[80vh]"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#262626]">
          <Search className="w-4 h-4 text-[#666] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search vault or run a command... (Esc to exit)"
            className="flex-1 bg-transparent text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none"
            autoFocus
          />
          <span className="text-[10px] font-mono text-[#666] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#262626]">
            ESC
          </span>
        </div>

        {/* Results / Suggestions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Matched Resources */}
          {filteredResources.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#666]">
                Matched Resources ({filteredResources.length})
              </div>
              {filteredResources.map((res) => {
                const Icon = getTypeIcon(res.type);
                return (
                  <button
                    key={res.id}
                    onClick={() => {
                      onSelectResource(res);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#1A1A1A] border border-transparent hover:border-[#262626] text-[#EDEDED] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-[#666] group-hover:text-white shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-white truncate">
                          {res.title}
                        </div>
                        {res.description && (
                          <div className="text-[11px] text-[#666] truncate">
                            {res.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#555] shrink-0">
                      {res.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#666]">
              Quick Actions
            </div>
            {actions.map((item) => {
              const ActionIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#1A1A1A] border border-transparent hover:border-[#262626] text-[#A1A1A1] hover:text-white transition-colors text-xs"
                >
                  <ActionIcon className="w-3.5 h-3.5 text-[#666] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0D0D0D] border-t border-[#262626] flex items-center justify-between text-[10px] text-[#555] font-mono">
          <span>Navigate with mouse or keyboard</span>
          <span>Vault PKM</span>
        </div>
      </div>
    </div>
  );
};
