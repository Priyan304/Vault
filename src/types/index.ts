export type ResourceType =
  | 'Bookmark'
  | 'Article'
  | 'Documentation'
  | 'Video'
  | 'Repository'
  | 'Note'
  | 'Code Snippet'
  | 'Diary'
  | 'Other';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  bio?: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  color?: string;
}

export interface ResourceTag {
  resource_id: string;
  tag_id: string;
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  url?: string;
  type: ResourceType;
  content?: string;
  language?: string; // For Code Snippets (e.g., 'typescript', 'python', 'sql', 'bash')
  mood?: string; // For Digital Diary entries (e.g., 'Focused', 'Inspired', 'Calm', 'Reflective')
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[]; // Resolved tags for convenient client use
}

export type ViewMode =
  | 'landing'
  | 'dashboard'
  | 'all'
  | 'favorites'
  | 'notes'
  | 'snippets'
  | 'diary'
  | 'tags'
  | 'profile'
  | 'settings';

export type SortOption = 'newest' | 'oldest' | 'title' | 'updated';
