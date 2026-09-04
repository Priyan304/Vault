import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Calendar,
  Check,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Lock,
  Pencil,
  Share2,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Resource } from '../types';
import { getTypeColor, getTypeIcon } from './ResourceCard';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePublic: (id: string) => void;
  onTagClick?: (tagName: string) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePublic,
  onTagClick,
}) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  if (!isOpen || !resource) return null;

  const Icon = getTypeIcon(resource.type);

  const handleCopyContent = () => {
    const text = resource.content || resource.url || resource.title;
    navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}?public_id=${resource.id}`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const createdDate = new Date(resource.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedDate = new Date(resource.updated_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="resource-detail-dialog"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-[#262626] bg-[#111] shadow-2xl text-[#EDEDED] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#262626] gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${getTypeColor(
                  resource.type
                )}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {resource.type}
              </span>

              {resource.mood && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-[#1A1A1A] text-white border border-[#333]">
                  Mood: {resource.mood}
                </span>
              )}

              <button
                onClick={() => onTogglePublic(resource.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono transition-colors border ${
                  resource.is_public
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                    : 'bg-[#1A1A1A] text-[#A1A1A1] border-[#262626] hover:text-white hover:border-[#333]'
                }`}
                title="Toggle public sharing"
              >
                {resource.is_public ? (
                  <>
                    <Share2 className="w-3 h-3" /> Public (Click to make private)
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> Private (Click to make public)
                  </>
                )}
              </button>

              {resource.is_public && (
                <button
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-[#1A1A1A] text-[#A1A1A1] hover:text-white border border-[#262626] hover:border-[#333] transition-colors"
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Share URL</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <h1 className="text-lg font-bold text-white tracking-tight leading-snug">
              {resource.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleFavorite(resource.id)}
              className={`p-2 rounded border transition-colors ${
                resource.is_favorite
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                  : 'border-[#262626] bg-[#1A1A1A] text-[#A1A1A1] hover:text-white hover:border-[#333]'
              }`}
              title={resource.is_favorite ? 'Favorited' : 'Add to favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(resource);
              }}
              className="p-2 rounded border border-[#262626] bg-[#1A1A1A] text-[#A1A1A1] hover:text-white hover:border-[#333] transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(resource.id);
              }}
              className="p-2 rounded border border-[#262626] bg-[#1A1A1A] text-[#A1A1A1] hover:text-rose-400 hover:border-rose-900/50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded border border-[#262626] bg-[#1A1A1A] text-[#A1A1A1] hover:text-white hover:border-[#333] transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* URL Card (if present) */}
          {resource.url && (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#262626] bg-[#1A1A1A]">
              <div className="flex items-center gap-2.5 min-w-0">
                <ExternalLink className="w-4 h-4 text-[#666] shrink-0" />
                <span className="text-xs font-mono text-[#EDEDED] truncate">
                  {resource.url}
                </span>
              </div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                Visit Link
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Description */}
          {resource.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#666]">
                Description
              </h4>
              <p className="text-xs text-[#A1A1A1] leading-relaxed bg-[#161616] p-3.5 rounded-lg border border-[#262626]">
                {resource.description}
              </p>
            </div>
          )}

          {/* Code Content */}
          {resource.type === 'Code Snippet' && resource.content && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-[#A1A1A1]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#666]">
                    Code Snippet ({resource.language || 'typescript'})
                  </span>
                </div>
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-1 text-xs font-mono text-[#A1A1A1] hover:text-white px-2.5 py-1 rounded bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] transition-colors"
                >
                  {copiedContent ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-lg border border-[#262626] bg-[#0A0A0A] p-4 font-mono text-xs text-[#EDEDED] overflow-x-auto">
                <pre>
                  <code>{resource.content}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Note Content (Markdown) */}
          {resource.type === 'Note' && resource.content && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#666]">
                  Note Content
                </h4>
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-1 text-xs font-mono text-[#A1A1A1] hover:text-white px-2.5 py-1 rounded bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] transition-colors"
                >
                  {copiedContent ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 rounded-lg border border-[#262626] bg-[#141414] text-xs leading-relaxed text-[#EDEDED]">
                <Markdown>{resource.content}</Markdown>
              </div>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#666]">
                Associated Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      onClose();
                      onTagClick?.(tag.name);
                    }}
                    className="px-2.5 py-0.5 rounded text-xs font-mono bg-[#1A1A1A] text-[#A1A1A1] hover:text-white hover:bg-[#222] border border-[#262626] transition-colors"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata timestamps */}
          <div className="pt-4 border-t border-[#262626] grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#666] font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#555]" />
              <span>Created: {createdDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#555]" />
              <span>Last Modified: {updatedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
