import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  Plus,
  StickyNote,
  Tag as TagIcon,
} from 'lucide-react';
import { Resource, ResourceType, ViewMode } from '../types';
import { ResourceCard } from './ResourceCard';

interface DashboardViewProps {
  stats: {
    totalResources: number;
    totalSnippets: number;
    totalNotes: number;
    totalDiary?: number;
    totalBookmarks: number;
    totalFavorites: number;
    totalTags: number;
  };
  recentResources: Resource[];
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenCreateModal: (type?: ResourceType) => void;

  onTagClick?: (tagName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentResources,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onNavigate,
  onOpenCreateModal,

  onTagClick,
}) => {
  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Knowledge Dashboard
          </h2>
          <p className="text-sm text-[#666] mt-1">
            "Everything worth remembering, in one private place."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateModal('Diary')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111] hover:bg-[#1A1A1A] text-[#A1A1A1] hover:text-white border border-[#262626] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#888]" />
            <span>New Diary</span>
          </button>
          <button
            onClick={() => onOpenCreateModal('Note')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111] hover:bg-[#1A1A1A] text-[#A1A1A1] hover:text-white border border-[#262626] transition-colors"
          >
            <StickyNote className="w-3.5 h-3.5 text-[#888]" />
            <span>New Note</span>
          </button>
          <button
            onClick={() => onOpenCreateModal('Code Snippet')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111] hover:bg-[#1A1A1A] text-[#A1A1A1] hover:text-white border border-[#262626] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#888]" />
            <span>New Snippet</span>
          </button>
          <button
            id="btn-knowledge-dashboard-create"
            onClick={() => onOpenCreateModal()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] shadow-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigate('all')}
          className="p-4 rounded-xl border border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="text-[10px] uppercase text-[#666] font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>All Resources</span>
            <Layers className="w-3.5 h-3.5 text-[#666] group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            {stats.totalResources}
          </div>
          <p className="text-[10px] text-[#555] font-mono mt-1">Saved across all categories</p>
        </div>

        <div
          onClick={() => onNavigate('diary')}
          className="p-4 rounded-xl border border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="text-[10px] uppercase text-[#666] font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Diary</span>
            <BookOpen className="w-3.5 h-3.5 text-[#666] group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            {stats.totalDiary ?? 0}
          </div>
          <p className="text-[10px] text-[#555] font-mono mt-1">Reflections & progress logs</p>
        </div>

        <div
          onClick={() => onNavigate('snippets')}
          className="p-4 rounded-xl border border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="text-[10px] uppercase text-[#666] font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Snippets</span>
            <Code2 className="w-3.5 h-3.5 text-[#666] group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            {stats.totalSnippets}
          </div>
          <p className="text-[10px] text-[#555] font-mono mt-1">Code & architecture syntax</p>
        </div>

        <div
          onClick={() => onNavigate('notes')}
          className="p-4 rounded-xl border border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="text-[10px] uppercase text-[#666] font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Notes</span>
            <StickyNote className="w-3.5 h-3.5 text-[#666] group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            {stats.totalNotes}
          </div>
          <p className="text-[10px] text-[#555] font-mono mt-1">Markdown knowledge docs</p>
        </div>

        <div
          onClick={() => onNavigate('tags')}
          className="p-4 rounded-xl border border-[#262626] bg-[#111] hover:border-[#333] hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="text-[10px] uppercase text-[#666] font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Tags</span>
            <TagIcon className="w-3.5 h-3.5 text-[#666] group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            {stats.totalTags}
          </div>
          <p className="text-[10px] text-[#555] font-mono mt-1">Classification taxonomy</p>
        </div>
      </div>



      {/* Recent Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#A1A1A1]">
              Recent Activity
            </h3>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('all')}
                className="text-xs px-2.5 py-1 bg-[#1A1A1A] border border-[#262626] rounded text-[#666] hover:text-[#A1A1A1] transition-colors"
              >
                All
              </button>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs px-2.5 py-1 bg-[#1A1A1A] border border-[#262626] rounded text-[#666] hover:text-[#A1A1A1] transition-colors"
              >
                Notes
              </button>
              <button
                onClick={() => onNavigate('snippets')}
                className="text-xs px-2.5 py-1 bg-[#1A1A1A] border border-[#262626] rounded text-[#666] hover:text-[#A1A1A1] transition-colors"
              >
                Snippets
              </button>
            </div>
          </div>
          <button
            onClick={() => onNavigate('all')}
            className="text-xs font-medium text-[#666] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentResources.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-[#262626] bg-[#111]">
            <Layers className="w-8 h-8 text-[#666] mx-auto mb-3" />
            <h4 className="text-sm font-medium text-white">Your Vault is empty</h4>
            <p className="text-xs text-[#666] mt-1 mb-4">
              Start building your personal library of links, documentation, notes, and code.
            </p>
            <button
              onClick={() => onOpenCreateModal()}
              className="px-4 py-2 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors"
            >
              + Create First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResources.slice(0, 6).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onOpenDetails={onOpenDetails}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
