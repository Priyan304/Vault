import React from 'react';
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  Layers,
  LogOut,
  Plus,
  Star,
  StickyNote,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Tag, ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  tags: (Tag & { count: number })[];
  selectedTag?: string;
  onSelectTag: (tagName?: string) => void;
  onOpenCreateModal: () => void;

  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalCounts: {
    all: number;
    favorites: number;
    notes: number;
    snippets: number;
    diary: number;
    tags: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  tags,
  selectedTag,
  onSelectTag,
  onOpenCreateModal,

  isOpenMobile,
  onCloseMobile,
  totalCounts,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'All Resources', icon: Layers, count: totalCounts.all },
    { id: 'favorites', label: 'Favorites', icon: Star, count: totalCounts.favorites },
    { id: 'notes', label: 'Notes', icon: StickyNote, count: totalCounts.notes },
    { id: 'snippets', label: 'Code Snippets', icon: Code2, count: totalCounts.snippets },
    { id: 'diary', label: 'Diary', icon: BookOpen, count: totalCounts.diary },
    { id: 'tags', label: 'Tags Catalog', icon: TagIcon, count: totalCounts.tags },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    onCloseMobile();
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      onSelectTag(undefined);
    } else {
      onSelectTag(tagName);
      onNavigate('all');
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 flex flex-col justify-between border-r border-[#262626] bg-[#0A0A0A] p-5 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto flex flex-col space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 bg-[#0A0A0A] rotate-45"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">VAULT</span>
            </button>

            {/* Mobile close */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-[#666] hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Action */}
          <div>
            <button
              id="sidebar-new-resource-btn"
              onClick={() => {
                onOpenCreateModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-white hover:bg-[#E5E5E5] text-black font-bold text-xs shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
              <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5E5E5] text-black font-semibold">
                N
              </kbd>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] uppercase tracking-widest text-[#666] font-bold">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id && !selectedTag;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border border-[#333] shadow-sm'
                      : 'text-[#A1A1A1] hover:text-white hover:bg-[#111]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <div className="w-2 h-2 rounded-full bg-white shrink-0"></div>
                    ) : (
                      <Icon className="w-4 h-4 text-[#666] shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#262626] text-white border border-[#333]'
                          : 'bg-[#1A1A1A] text-[#666]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tags section */}
          <div className="space-y-1 pt-4 border-t border-[#262626]">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#666] font-bold">
                Tags
              </span>
              <button
                onClick={() => handleNavClick('tags')}
                className="text-[10px] text-[#666] hover:text-[#A1A1A1] transition-colors uppercase font-mono"
              >
                Manage
              </button>
            </div>

            <div className="space-y-0.5">
              {tags.slice(0, 8).map((t) => {
                const isSelected = selectedTag === t.name;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTagClick(t.name)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border border-[#333] font-medium'
                        : 'text-[#A1A1A1] hover:text-white hover:bg-[#111]'
                    }`}
                  >
                    <span className="font-mono">#{t.name}</span>
                    <span className="text-[10px] text-[#666] font-mono">{t.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Learning Guide & User Switcher */}
        <div className="pt-4 border-t border-[#262626] space-y-3">

          {/* User Profile / Switch */}
          {user && (
            <div className="p-3 rounded-xl border border-[#262626] bg-[#111] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0">
                    {user.display_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-white truncate leading-snug">
                      {user.display_name}
                    </div>
                    <div className="text-xs text-[#666] truncate font-mono">
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-[#666] hover:text-rose-400 hover:bg-[#1A1A1A] rounded transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
