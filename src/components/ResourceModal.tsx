import React, { useEffect, useState } from 'react';
import { Globe, X } from 'lucide-react';
import { Resource, ResourceType, Tag } from '../types';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: {
      title: string;
      description?: string;
      url?: string;
      type: ResourceType;
      content?: string;
      language?: string;
      mood?: string;
      created_at?: string;
      is_favorite?: boolean;
      is_public?: boolean;
    },
    tagNames: string[]
  ) => Promise<void> | void;
  initialData?: Resource | null;
  availableTags: (Tag & { count: number })[];
  defaultType?: ResourceType;
}

const RESOURCE_TYPES: ResourceType[] = [
  'Bookmark',
  'Article',
  'Documentation',
  'Video',
  'Repository',
  'Note',
  'Code Snippet',
  'Diary',
  'Other',
];

const DIARY_MOODS = [
  { label: 'Focused', emoji: '⚡' },
  { label: 'Inspired', emoji: '✨' },
  { label: 'Productive', emoji: '🚀' },
  { label: 'Calm', emoji: '🌿' },
  { label: 'Thoughtful', emoji: '🧠' },
  { label: 'Reflective', emoji: '☕' },
];

const CODE_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'sql',
  'bash',
  'html',
  'css',
  'json',
  'yaml',
  'go',
  'rust',
  'markdown',
];

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableTags,
  defaultType = 'Bookmark',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>(defaultType);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [mood, setMood] = useState('Focused');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setUrl(initialData.url || '');
      setType(initialData.type);
      setContent(initialData.content || '');
      setLanguage(initialData.language || 'typescript');
      setMood(initialData.mood || 'Focused');
      setEntryDate(
        initialData.created_at
          ? initialData.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setIsFavorite(initialData.is_favorite);
      setIsPublic(initialData.is_public);
      setSelectedTags(initialData.tags ? initialData.tags.map((t) => t.name) : []);
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setType(defaultType);
      setContent('');
      setLanguage('typescript');
      setMood('Focused');
      setEntryDate(new Date().toISOString().split('T')[0]);
      setIsFavorite(false);
      setIsPublic(false);
      setSelectedTags(defaultType === 'Diary' ? ['daily', 'reflection'] : []);
    }
    setErrors({});
    setSaveError(null);
    setTagInput('');
  }, [initialData, isOpen, defaultType]);

  if (!isOpen) return null;

  const validateUrl = (testUrl: string) => {
    if (!testUrl) return true;
    try {
      new URL(testUrl);
      return true;
    } catch {
      // Also allow missing http/https by prepending if user types example.com
      try {
        new URL(`https://${testUrl}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const handleAddTag = (tagName: string) => {
    const clean = tagName.trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; url?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (url && !validateUrl(url)) {
      newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format url
    let formattedUrl = url.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await onSave(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          url: formattedUrl || undefined,
          type,
          content: content.trim() || undefined,
          language: type === 'Code Snippet' ? language : undefined,
          mood: type === 'Diary' ? mood : undefined,
          created_at: type === 'Diary' && entryDate ? new Date(entryDate).toISOString() : undefined,
          is_favorite: isFavorite,
          is_public: isPublic,
        },
        selectedTags
      );
      onClose();
    } catch (err: any) {
      console.error('Failed to save resource in modal:', err);
      setSaveError(
        err?.message ||
        (typeof err === 'string' ? err : 'Failed to save resource. Please verify database permissions and schema.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="resource-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-[#262626] bg-[#111] shadow-2xl text-[#EDEDED] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <div>
            <h2 className="text-base font-semibold text-white">
              {type === 'Diary'
                ? initialData
                  ? 'Edit Diary Entry'
                  : 'Write Diary Entry'
                : initialData
                ? 'Edit Resource'
                : 'Create New Resource'}
            </h2>
            <p className="text-xs text-[#666]">
              {type === 'Diary'
                ? 'Private personal reflection recorded with Row Level Security'
                : 'Add links, notes, or code snippets to your private vault'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#666] mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-lg bg-[#0A0A0A] border border-[#262626]">
              {RESOURCE_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-2.5 py-1.5 text-xs rounded font-medium transition-all text-center truncate ${
                    type === t
                      ? 'bg-[#1A1A1A] border border-[#333] text-white shadow-sm font-semibold'
                      : 'text-[#666] hover:text-[#A1A1A1] hover:bg-[#151515]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label htmlFor="resource-title" className="block text-xs font-mono uppercase tracking-wider text-[#666] mb-1">
              {type === 'Diary' ? 'Diary Title / Focus' : 'Title'} <span className="text-rose-400">*</span>
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder={
                type === 'Diary'
                  ? 'e.g. Weekly Reflections & Architectural Breakthrough'
                  : 'e.g. React 19 Server Components Mental Model'
              }
              className={`w-full px-3.5 py-2 rounded-lg border bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none ${
                errors.title
                  ? 'border-rose-500'
                  : 'border-[#262626] focus:border-[#444]'
              }`}
              autoFocus
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* Diary Specific Controls: Mood & Date */}
          {type === 'Diary' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-[#262626] bg-[#0A0A0A]">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#666] mb-1.5">
                  Today's Mood / Mindset
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {DIARY_MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m.label)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1 ${
                        mood === m.label
                          ? 'bg-white text-black font-semibold'
                          : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="diary-date" className="block text-[11px] font-mono uppercase tracking-wider text-[#666] mb-1.5">
                  Entry Date
                </label>
                <input
                  id="diary-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#444]"
                />
                <p className="mt-1 text-[10px] text-[#666]">
                  Entries are stored with strict Row Level Security (RLS)
                </p>
              </div>
            </div>
          )}

          {/* URL Input (Optional, hidden for Diary unless desired) */}
          {type !== 'Diary' && (
            <div>
              <label htmlFor="resource-url" className="block text-xs font-mono uppercase tracking-wider text-[#666] mb-1">
                URL Reference (Optional)
              </label>
              <div className="relative">
                <input
                  id="resource-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.url) setErrors({ ...errors, url: undefined });
                  }}
                  placeholder="https://..."
                  className={`w-full pl-3.5 pr-9 py-2 rounded-lg border bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] font-mono focus:outline-none ${
                    errors.url
                      ? 'border-rose-500'
                      : 'border-[#262626] focus:border-[#444]'
                  }`}
                />
                <Globe className="w-3.5 h-3.5 text-[#666] absolute right-3 top-3" />
              </div>
              {errors.url && <p className="mt-1 text-xs text-rose-400">{errors.url}</p>}
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="resource-description" className="block text-xs font-mono uppercase tracking-wider text-[#666] mb-1">
              {type === 'Diary' ? 'Summary / Key Takeaway (Optional)' : 'Description / Summary'}
            </label>
            <textarea
              id="resource-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'Diary'
                  ? 'A quick 1-2 sentence overview of today...'
                  : 'Key takeaways, why this is useful, or reference context...'
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444] resize-none"
            />
          </div>

          {/* Content / Code area for Snippets, Notes, & Diary */}
          {(type === 'Code Snippet' || type === 'Note' || type === 'Diary') && (
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="resource-content" className="text-xs font-mono uppercase tracking-wider text-[#666]">
                  {type === 'Code Snippet'
                    ? 'Code Content'
                    : type === 'Diary'
                    ? 'Diary Reflection & Body (Markdown supported)'
                    : 'Note Content (Markdown supported)'}
                </label>
                {type === 'Code Snippet' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#666] font-mono">Language:</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#262626] text-xs font-mono text-[#A1A1A1] focus:outline-none"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <textarea
                id="resource-content"
                rows={type === 'Diary' ? 8 : 7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'Code Snippet'
                    ? '// Paste code snippet here...'
                    : type === 'Diary'
                    ? '### What happened today?\n\n- Key achievements or breakthroughs\n- Challenges faced & solutions\n- Thoughts for tomorrow'
                    : '# My Notes\n- Point 1\n- Point 2'
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#262626] bg-[#0A0A0A] font-mono text-xs text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#444]"
              />
            </div>
          )}

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#666] mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {selectedTags.map((tagName) => (
                <span
                  key={tagName}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-[#1A1A1A] text-[#A1A1A1] border border-[#262626]"
                >
                  #{tagName}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tagName)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Type tag name and press Enter..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#262626] bg-[#1A1A1A] text-xs text-[#EDEDED] placeholder-[#666] font-mono focus:outline-none focus:border-[#444]"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 rounded text-xs font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] text-[#A1A1A1] hover:text-white disabled:opacity-40 transition-colors"
              >
                + Add Tag
              </button>
            </div>

            {/* Suggestions from existing tags */}
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-[#666]">Suggestions:</span>
                {availableTags
                  .filter((t) => !selectedTags.includes(t.name))
                  .slice(0, 5)
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag.name)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] text-[#888] hover:text-white transition-colors"
                    >
                      +{tag.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Visibility and Favorite switches */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#262626]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A1A1A1] hover:text-white">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded border-[#262626] bg-[#1A1A1A] text-amber-500 focus:ring-0"
              />
              <span>Mark as Favorite</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A1A1A1] hover:text-white">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-[#262626] bg-[#1A1A1A] text-blue-500 focus:ring-0"
              />
              <span>Make Public (Shareable link enabled)</span>
            </label>
          </div>

          {/* Error Message Banner */}
          {saveError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2 animate-in fade-in duration-150">
              <span className="font-bold text-red-400 shrink-0">⚠️ Error:</span>
              <span className="flex-1 break-words">{saveError}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-[#888] hover:text-white rounded hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submit-resource-btn"
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold bg-white text-black hover:bg-[#E5E5E5] disabled:opacity-60 disabled:cursor-not-allowed rounded transition-all shadow-md flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : type === 'Diary' ? (
                initialData ? 'Save Diary Entry' : 'Record Diary Entry'
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Create Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
