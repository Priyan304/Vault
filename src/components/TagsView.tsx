import React, { useState } from 'react';
import { Hash, Search, Tag as TagIcon, Trash2 } from 'lucide-react';
import { Resource, Tag } from '../types';
import { ResourceCard } from './ResourceCard';

interface TagsViewProps {
  tags: (Tag & { count: number })[];
  resources: Resource[];
  onCreateTag: (name: string, color?: string) => void;
  onDeleteTag: (id: string) => void;
  onSelectTag: (tagName: string) => void;
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const PRESET_COLORS = [
  '#3178c6', // TS blue
  '#61dafb', // React cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
];

export const TagsView: React.FC<TagsViewProps> = ({
  tags,
  resources,
  onCreateTag,
  onDeleteTag,
  onSelectTag,
  onOpenDetails,
  onEdit,
  onDeleteResource,
  onToggleFavorite,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onCreateTag(newTagName.trim(), selectedColor);
    setNewTagName('');
  };

  const taggedResources = activeTagFilter
    ? resources.filter((r) => r.tags?.some((t) => t.name === activeTagFilter))
    : [];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#A1A1A1]">
            <TagIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tags Catalog</h2>
            <p className="text-xs text-[#666]">
              Taxonomy for cross-linking documentation, links, and code snippets
            </p>
          </div>
        </div>
      </div>

      {/* Create New Tag Bar */}
      <form
        onSubmit={handleCreate}
        className="p-4 rounded-xl border border-[#262626] bg-[#111] flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Hash className="w-3.5 h-3.5 text-[#666] absolute left-3 top-3" />
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Create new tag (e.g. docker, rust, auth)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] font-mono focus:outline-none focus:border-[#444]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedColor === c ? 'scale-125 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="px-4 py-2 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] disabled:opacity-40 transition-colors shrink-0 shadow-sm"
          >
            + Add Tag
          </button>
        </div>
      </form>

      {/* Tags Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#666]">
            Active Tags ({tags.length})
          </h3>
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tags..."
              className="w-full pl-8 pr-2 py-1 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredTags.map((tag) => {
            const isSelected = activeTagFilter === tag.name;
            return (
              <div
                key={tag.id}
                onClick={() => setActiveTagFilter(isSelected ? null : tag.name)}
                className={`group p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#444] bg-[#1A1A1A] text-white shadow-sm'
                    : 'border-[#262626] bg-[#111] hover:bg-[#151515] hover:border-[#333] text-[#A1A1A1]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color || '#64748b' }}
                    />
                    <span className="font-mono text-xs font-semibold truncate text-white">
                      #{tag.name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTag(tag.id);
                    }}
                    className="p-1 rounded text-[#666] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete tag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#666] font-mono mt-1">
                  <span>{tag.count} {tag.count === 1 ? 'item' : 'items'}</span>
                  <span className="text-[10px] text-[#555] group-hover:text-white transition-colors">
                    {isSelected ? 'Click to deselect' : 'View items →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtered Resources Section (if a tag is clicked) */}
      {activeTagFilter && (
        <div className="space-y-4 pt-6 border-t border-[#262626]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Resources tagged with <span className="text-white font-mono">#{activeTagFilter}</span> ({taggedResources.length})
            </h3>
            <button
              onClick={() => setActiveTagFilter(null)}
              className="text-xs text-[#A1A1A1] hover:text-white underline"
            >
              Close Tag View
            </button>
          </div>

          {taggedResources.length === 0 ? (
            <p className="text-xs text-[#666] font-mono">
              No resources currently tagged with #{activeTagFilter}.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taggedResources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onOpenDetails={onOpenDetails}
                  onEdit={onEdit}
                  onDelete={onDeleteResource}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
