import React from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  GitFork,
  Globe,
  Lock,
  Pencil,
  Play,
  Share2,
  Star,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { Resource, ResourceType } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onOpenDetails: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick?: (tagName: string) => void;
}

export const getTypeIcon = (type: ResourceType) => {
  switch (type) {
    case 'Bookmark':
      return Globe;
    case 'Article':
      return FileText;
    case 'Documentation':
      return BookOpen;
    case 'Video':
      return Play;
    case 'Repository':
      return GitFork;
    case 'Note':
      return StickyNote;
    case 'Code Snippet':
      return Code2;
    case 'Diary':
      return BookOpen;
    default:
      return Bookmark;
  }
};

export const getTypeColor = (type: ResourceType) => {
  switch (type) {
    case 'Bookmark':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Article':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Documentation':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Video':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'Repository':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Note':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'Code Snippet':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Diary':
      return 'bg-white/10 text-white border-white/20';
    default:
      return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}) => {
  const [copied, setCopied] = React.useState(false);
  const Icon = getTypeIcon(resource.type);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = resource.content || resource.url || resource.title;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={`resource-card-${resource.id}`}
      onClick={() => onOpenDetails(resource)}
      className="group relative flex flex-col justify-between rounded-xl border border-[#262626] bg-[#111] p-4 sm:p-5 transition-all duration-200 hover:border-[#333] hover:bg-[#151515] cursor-pointer shadow-sm"
    >
      <div>
        {/* Header: Type Badge, Privacy & Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border border-[#333] bg-[#1A1A1A] text-[#888]"
            >
              <Icon className="w-3 h-3 text-[#A1A1A1]" />
              {resource.type}
            </span>

            {resource.is_public ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#666] font-mono" title="Public resource">
                <Share2 className="w-3 h-3 text-[#666]" />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#666] font-mono" title="Private resource">
                <Lock className="w-3 h-3 text-[#666]" />
                Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              id={`btn-fav-${resource.id}`}
              onClick={() => onToggleFavorite(resource.id)}
              className={`p-1.5 rounded transition-colors ${
                resource.is_favorite
                  ? 'text-amber-400 hover:bg-amber-400/10'
                  : 'text-[#666] hover:text-white hover:bg-[#1A1A1A]'
              }`}
              title={resource.is_favorite ? 'Remove favorite' : 'Mark favorite'}
            >
              <Star className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              id={`btn-edit-${resource.id}`}
              onClick={() => onEdit(resource)}
              className="p-1.5 text-[#666] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Edit resource"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              id={`btn-delete-${resource.id}`}
              onClick={() => onDelete(resource.id)}
              className="p-1.5 text-[#666] hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Delete resource"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white group-hover:text-white line-clamp-1 mb-1 transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#666] line-clamp-2 mb-3 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Code Snippet Preview (if applicable) */}
        {resource.type === 'Code Snippet' && resource.content && (
          <div className="relative mb-3 rounded-lg border border-[#262626] bg-[#1A1A1A] p-3 font-mono text-xs text-[#EDEDED] overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#262626] text-[10px] text-[#666]">
              <span className="uppercase tracking-wider">{resource.language || 'code'}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-24 overflow-hidden text-[#A1A1A1] line-clamp-4 select-text">
              <code>{resource.content}</code>
            </pre>
          </div>
        )}

        {/* Note Preview */}
        {resource.type === 'Note' && resource.content && (
          <div className="mb-3 rounded-lg border border-[#262626] bg-[#1A1A1A] p-2.5 text-xs text-[#A1A1A1] line-clamp-3">
            {resource.content.replace(/^#+\s+/gm, '')}
          </div>
        )}

        {/* URL Link preview */}
        {resource.url && (
          <div className="mb-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#EDEDED] transition-colors truncate max-w-full font-mono"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{resource.url.replace(/^https?:\/\//, '')}</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer: Tags and Date */}
      <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
          {resource.tags && resource.tags.length > 0 ? (
            resource.tags.slice(0, 3).map((tag) => (
              <button
                key={tag.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag.name);
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#A1A1A1] hover:text-white border border-[#262626] hover:border-[#333] transition-colors"
              >
                #{tag.name}
              </button>
            ))
          ) : (
            <span className="text-[10px] text-[#555] font-mono">No tags</span>
          )}
          {resource.tags && resource.tags.length > 3 && (
            <span className="text-[10px] text-[#555] font-mono">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>

        <span className="text-[10px] text-[#444] font-mono shrink-0">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
