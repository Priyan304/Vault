import React, { useState } from 'react';
import {
  Layers,
  Search,
  Star,
  X,
} from 'lucide-react';
import { Resource, ResourceType, SortOption, Tag } from '../types';
import { ResourceCard } from './ResourceCard';

interface AllResourcesViewProps {
  resources: Resource[];
  availableTags: (Tag & { count: number })[];
  selectedType: ResourceType | 'All';
  onSelectType: (type: ResourceType | 'All') => void;
  selectedTag?: string;
  onSelectTag: (tagName?: string) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateModal: () => void;
}

const RESOURCE_TYPES: (ResourceType | 'All')[] = [
  'All',
  'Bookmark',
  'Article',
  'Documentation',
  'Video',
  'Repository',
  'Note',
  'Code Snippet',
  'Other',
];

export const AllResourcesView: React.FC<AllResourcesViewProps> = ({
  resources,
  availableTags,
  selectedType,
  onSelectType,
  selectedTag,
  onSelectTag,
  favoritesOnly,
  onToggleFavoritesOnly,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenCreateModal,
}) => {
  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-4">
        {/* Search & Main Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, description, URL, code, or tags..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-[#666] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Favorites Toggle */}
            <button
              onClick={onToggleFavoritesOnly}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-colors shrink-0 ${
                favoritesOnly
                  ? 'bg-[#1A1A1A] border-amber-400/40 text-amber-400'
                  : 'border-[#262626] bg-[#111] text-[#A1A1A1] hover:text-white hover:border-[#333]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>

            {/* Tag Filter Dropdown */}
            <select
              value={selectedTag || ''}
              onChange={(e) => onSelectTag(e.target.value ? e.target.value : undefined)}
              className="px-3 py-2 rounded border border-[#262626] bg-[#111] text-xs text-[#A1A1A1] hover:text-white focus:outline-none shrink-0 font-mono"
            >
              <option value="">All Tags</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.name}>
                  #{t.name} ({t.count})
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-3 py-2 rounded border border-[#262626] bg-[#111] text-xs text-[#A1A1A1] hover:text-white focus:outline-none shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onSelectType(t)}
              className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 transition-colors ${
                selectedType === t
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-[#1A1A1A] text-[#666] hover:text-[#A1A1A1] hover:bg-[#1f1f1f] border border-[#262626]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#666] font-mono border-b border-[#262626] pb-2">
        <span>
          Showing {resources.length} {resources.length === 1 ? 'item' : 'items'}
          {selectedType !== 'All' ? ` of type "${selectedType}"` : ''}
          {selectedTag ? ` tagged "#${selectedTag}"` : ''}
          {favoritesOnly ? ' in Favorites' : ''}
        </span>
        {(selectedType !== 'All' || selectedTag || favoritesOnly || searchQuery) && (
          <button
            onClick={() => {
              onSelectType('All');
              onSelectTag(undefined);
              if (favoritesOnly) onToggleFavoritesOnly();
              onSearchChange('');
            }}
            className="text-[#A1A1A1] hover:text-white underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#262626] bg-[#111]">
          <Layers className="w-8 h-8 text-[#666] mx-auto mb-3" />
          <h4 className="text-sm font-medium text-white">No resources found</h4>
          <p className="text-xs text-[#666] mt-1 mb-4">
            Try adjusting your search query, clearing active filters, or adding a new resource.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors"
          >
            + Add Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onTagClick={(tag) => onSelectTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
