import React from 'react';
import {
  Database,
  Menu,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onOpenCommandPalette: () => void;
  onOpenCreateModal: () => void;
  onOpenMobileMenu: () => void;
  onOpenSchemaGuide: () => void;
  selectedTag?: string;
  onClearSelectedTag: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onOpenCommandPalette,
  onOpenCreateModal,
  onOpenMobileMenu,
  onOpenSchemaGuide,
  selectedTag,
  onClearSelectedTag,
  searchQuery,
  onSearchChange,
}) => {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'all':
        return 'All Resources';
      case 'favorites':
        return 'Favorites';
      case 'notes':
        return 'Personal Notes';
      case 'snippets':
        return 'Code Snippets';
      case 'diary':
        return 'Digital Diary';
      case 'tags':
        return 'Tags Catalog';
      case 'profile':
        return 'User Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#262626] bg-[#0A0A0A]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {getTitle()}
          </h1>
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-[#1A1A1A] text-white border border-[#333]">
              <span>#{selectedTag}</span>
              <button
                onClick={onClearSelectedTag}
                className="hover:text-rose-400 text-[#888]"
                title="Clear tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Middle/Right: Search Bar & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end max-w-xl">
        {/* Search trigger */}
        <div
          onClick={onOpenCommandPalette}
          className="flex items-center flex-1 max-w-xs sm:max-w-md bg-[#1A1A1A] border border-[#262626] hover:border-[#333] rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#666] shrink-0" />
          <span className="text-xs sm:text-sm text-[#666] ml-2 truncate">
            {searchQuery ? searchQuery : 'Search resources, notes, snippets...'}
          </span>
          <span className="hidden sm:inline-block ml-auto text-[10px] bg-[#262626] text-[#666] px-1.5 py-0.5 rounded border border-[#333] font-mono">
            ⌘ K
          </span>
        </div>

        {/* Database Architecture Blueprint shortcut */}
        <button
          onClick={onOpenSchemaGuide}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#A1A1A1] hover:text-white bg-[#111] hover:bg-[#1A1A1A] border border-[#262626] transition-colors shrink-0"
          title="Inspect PostgreSQL Schema & RLS"
        >
          <Database className="w-3.5 h-3.5 text-[#888]" />
          <span>Schema</span>
        </button>

        {/* New Resource button */}
        <button
          id="navbar-add-btn"
          onClick={onOpenCreateModal}
          className="bg-white text-black text-xs font-bold px-3.5 sm:px-4 py-2 rounded shadow-lg hover:bg-[#E5E5E5] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create</span>
        </button>
      </div>
    </header>
  );
};
