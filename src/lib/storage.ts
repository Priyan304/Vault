import { Profile, Resource, ResourceTag, ResourceType, Tag } from '../types';

const STORAGE_KEY = 'vault_app_db_v2';

interface DatabaseState {
  profiles: Profile[];
  resources: Omit<Resource, 'tags'>[];
  tags: Tag[];
  resource_tags: ResourceTag[];
}

const EMPTY_DATABASE: DatabaseState = {
  profiles: [],
  resources: [],
  tags: [],
  resource_tags: [],
};

function getRawDB(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(EMPTY_DATABASE));
      return {
        profiles: [],
        resources: [],
        tags: [],
        resource_tags: [],
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse database state from localStorage', err);
    return {
      profiles: [],
      resources: [],
      tags: [],
      resource_tags: [],
    };
  }
}

function saveRawDB(state: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save database state to localStorage', err);
  }
}

export const db = {
  // Profiles
  getProfile(userId: string): Profile | null {
    const state = getRawDB();
    const profile = state.profiles.find((p) => p.id === userId);
    return profile || null;
  },

  upsertProfile(profile: Profile): void {
    const state = getRawDB();
    const idx = state.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      state.profiles[idx] = { ...state.profiles[idx], ...profile };
    } else {
      state.profiles.push(profile);
    }
    saveRawDB(state);
  },

  // Tags
  getTags(userId: string): (Tag & { count: number })[] {
    const state = getRawDB();
    const userTags = state.tags.filter((t) => t.user_id === userId);
    const userResourceIds = new Set(
      state.resources.filter((r) => r.user_id === userId).map((r) => r.id)
    );

    return userTags.map((tag) => {
      const count = state.resource_tags.filter(
        (rt) => rt.tag_id === tag.id && userResourceIds.has(rt.resource_id)
      ).length;
      return { ...tag, count };
    });
  },

  createTag(userId: string, name: string, color?: string): Tag {
    const state = getRawDB();
    const trimmed = name.trim();
    const existing = state.tags.find(
      (t) => t.user_id === userId && t.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const newTag: Tag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: trimmed,
      color: color || '#64748b',
      created_at: new Date().toISOString(),
    };
    state.tags.push(newTag);
    saveRawDB(state);
    return newTag;
  },

  deleteTag(tagId: string, userId: string): void {
    const state = getRawDB();
    state.tags = state.tags.filter((t) => !(t.id === tagId && t.user_id === userId));
    state.resource_tags = state.resource_tags.filter((rt) => rt.tag_id !== tagId);
    saveRawDB(state);
  },

  // Resources
  getResources(
    userId: string,
    options?: {
      search?: string;
      type?: ResourceType | 'All';
      tagId?: string;
      favoritesOnly?: boolean;
      sort?: 'newest' | 'oldest' | 'title' | 'updated';
    }
  ): Resource[] {
    const state = getRawDB();
    let userResources = state.resources.filter((r) => r.user_id === userId);

    if (options?.favoritesOnly) {
      userResources = userResources.filter((r) => r.is_favorite);
    }

    if (options?.type && options.type !== 'All') {
      userResources = userResources.filter((r) => r.type === options.type);
    }

    if (options?.tagId) {
      const taggedResourceIds = new Set(
        state.resource_tags
          .filter((rt) => rt.tag_id === options.tagId)
          .map((rt) => rt.resource_id)
      );
      userResources = userResources.filter((r) => taggedResourceIds.has(r.id));
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      userResources = userResources.filter((r) => {
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = r.description?.toLowerCase().includes(q) || false;
        const inContent = r.content?.toLowerCase().includes(q) || false;
        const inUrl = r.url?.toLowerCase().includes(q) || false;

        // Also check if any associated tag matches
        const resTags = state.resource_tags
          .filter((rt) => rt.resource_id === r.id)
          .map((rt) => state.tags.find((t) => t.id === rt.tag_id)?.name.toLowerCase())
          .filter(Boolean);
        const inTags = resTags.some((tag) => tag && tag.includes(q));

        return inTitle || inDesc || inContent || inUrl || inTags;
      });
    }

    // Sort
    userResources.sort((a, b) => {
      if (options?.sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (options?.sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (options?.sort === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      // Default newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Populate tags for each resource
    return userResources.map((r) => {
      const tagIds = state.resource_tags
        .filter((rt) => rt.resource_id === r.id)
        .map((rt) => rt.tag_id);
      const tags = state.tags.filter((t) => tagIds.includes(t.id));
      return {
        ...r,
        tags,
      };
    });
  },

  getResource(id: string, userId: string): Resource | null {
    const state = getRawDB();
    const item = state.resources.find((r) => r.id === id && (r.user_id === userId || r.is_public));
    if (!item) return null;

    const tagIds = state.resource_tags
      .filter((rt) => rt.resource_id === item.id)
      .map((rt) => rt.tag_id);
    const tags = state.tags.filter((t) => tagIds.includes(t.id));

    return {
      ...item,
      tags,
    };
  },

  createResource(
    userId: string,
    data: {
      title: string;
      description?: string;
      url?: string;
      type: ResourceType;
      content?: string;
      language?: string;
      mood?: string;
      is_favorite?: boolean;
      is_public?: boolean;
      created_at?: string;
    },
    tagNames: string[] = []
  ): Resource {
    const state = getRawDB();
    const now = new Date().toISOString();
    const entryDate = data.created_at || now;
    const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newResource: Omit<Resource, 'tags'> = {
      id: newId,
      user_id: userId,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      url: data.url?.trim() || undefined,
      type: data.type,
      content: data.content?.trim() || undefined,
      language: data.language || undefined,
      mood: data.mood?.trim() || undefined,
      is_favorite: data.is_favorite ?? false,
      is_public: data.is_public ?? false,
      created_at: entryDate,
      updated_at: now,
    };

    state.resources.unshift(newResource);

    // Process tags
    const attachedTags: Tag[] = [];
    for (const name of tagNames) {
      const clean = name.trim();
      if (!clean) continue;
      let existingTag = state.tags.find(
        (t) => t.user_id === userId && t.name.toLowerCase() === clean.toLowerCase()
      );
      if (!existingTag) {
        existingTag = {
          id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: userId,
          name: clean,
          created_at: now,
        };
        state.tags.push(existingTag);
      }
      state.resource_tags.push({ resource_id: newId, tag_id: existingTag.id });
      attachedTags.push(existingTag);
    }

    saveRawDB(state);
    return { ...newResource, tags: attachedTags };
  },

  updateResource(
    id: string,
    userId: string,
    data: Partial<Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tags'>>,
    tagNames?: string[]
  ): Resource | null {
    const state = getRawDB();
    const idx = state.resources.findIndex((r) => r.id === id && r.user_id === userId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    state.resources[idx] = {
      ...state.resources[idx],
      ...data,
      updated_at: now,
    };

    if (tagNames !== undefined) {
      // Clear existing resource_tags
      state.resource_tags = state.resource_tags.filter((rt) => rt.resource_id !== id);
      // Re-add
      for (const name of tagNames) {
        const clean = name.trim();
        if (!clean) continue;
        let existingTag = state.tags.find(
          (t) => t.user_id === userId && t.name.toLowerCase() === clean.toLowerCase()
        );
        if (!existingTag) {
          existingTag = {
            id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            user_id: userId,
            name: clean,
            created_at: now,
          };
          state.tags.push(existingTag);
        }
        state.resource_tags.push({ resource_id: id, tag_id: existingTag.id });
      }
    }

    saveRawDB(state);
    return this.getResource(id, userId);
  },

  deleteResource(id: string, userId: string): boolean {
    const state = getRawDB();
    const initialLen = state.resources.length;
    state.resources = state.resources.filter((r) => !(r.id === id && r.user_id === userId));
    state.resource_tags = state.resource_tags.filter((rt) => rt.resource_id !== id);
    saveRawDB(state);
    return state.resources.length < initialLen;
  },

  toggleFavorite(id: string, userId: string): boolean {
    const state = getRawDB();
    const resource = state.resources.find((r) => r.id === id && r.user_id === userId);
    if (!resource) return false;
    resource.is_favorite = !resource.is_favorite;
    resource.updated_at = new Date().toISOString();
    saveRawDB(state);
    return resource.is_favorite;
  },

  togglePublic(id: string, userId: string): boolean {
    const state = getRawDB();
    const resource = state.resources.find((r) => r.id === id && r.user_id === userId);
    if (!resource) return false;
    resource.is_public = !resource.is_public;
    resource.updated_at = new Date().toISOString();
    saveRawDB(state);
    return resource.is_public;
  },

  getStats(userId: string) {
    const state = getRawDB();
    const userResources = state.resources.filter((r) => r.user_id === userId);
    const snippets = userResources.filter((r) => r.type === 'Code Snippet').length;
    const notes = userResources.filter((r) => r.type === 'Note').length;
    const diary = userResources.filter((r) => r.type === 'Diary').length;
    const bookmarks = userResources.filter((r) => r.type === 'Bookmark' || r.type === 'Article' || r.type === 'Documentation').length;
    const favorites = userResources.filter((r) => r.is_favorite).length;
    const tagsCount = state.tags.filter((t) => t.user_id === userId).length;

    return {
      totalResources: userResources.length,
      totalSnippets: snippets,
      totalNotes: notes,
      totalDiary: diary,
      totalBookmarks: bookmarks,
      totalFavorites: favorites,
      totalTags: tagsCount,
    };
  },

  resetDefaults(userId: string) {
    const state = getRawDB();
    state.resources = state.resources.filter((r) => r.user_id !== userId);
    state.tags = state.tags.filter((t) => t.user_id !== userId);
    const remainingIds = new Set(state.resources.map((r) => r.id));
    state.resource_tags = state.resource_tags.filter((rt) => remainingIds.has(rt.resource_id));
    saveRawDB(state);
  },

  exportDatabase(userId: string): string {
    const state = getRawDB();
    const userResources = this.getResources(userId);
    const userTags = this.getTags(userId);
    const profile = this.getProfile(userId);

    const payload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      tags: userTags,
      resources: userResources,
    };
    return JSON.stringify(payload, null, 2);
  },

  // Raw database tables for the educational Database Inspector
  getRawTables() {
    return getRawDB();
  },
};

// PostgreSQL Schema & RLS Educational Blueprint
export const POSTGRES_SCHEMA_SQL = `-- VAULT: PostgreSQL & Supabase Database Schema DDL
-- Execute in Supabase SQL Editor

-- 1. Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type TEXT NOT NULL CHECK (type IN ('Bookmark', 'Article', 'Documentation', 'Video', 'Repository', 'Note', 'Code Snippet', 'Diary', 'Other')),
  content TEXT,
  language TEXT,
  mood TEXT,
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- 4. Resource Tags Join Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.resource_tags (
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (resource_id, tag_id)
);

-- 5. Row Level Security (RLS) Policies (Supabase)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- Profile Policies:
CREATE POLICY "Users can view own profile or public profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Resource Policies:
CREATE POLICY "Users can read own resources or public resources"
  ON public.resources FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);

-- Tags Policies:
CREATE POLICY "Users can manage own tags"
  ON public.tags FOR ALL
  USING (auth.uid() = user_id);

-- Resource Tags Policies:
CREATE POLICY "Users can manage own resource tags"
  ON public.resource_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources
      WHERE id = resource_tags.resource_id AND user_id = auth.uid()
    )
  );
`;
