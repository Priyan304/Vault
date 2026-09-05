import { supabase } from './supabaseClient';
import { Profile, Resource, ResourceType, Tag } from '../types';

interface ResourceRow extends Omit<Resource, 'tags'> {
  resource_tags: { tags: Tag }[] | null;
}

function flattenResource(row: ResourceRow): Resource {
  const { resource_tags, ...rest } = row;
  return {
    ...rest,
    tags: (resource_tags ?? []).map((rt) => rt.tags).filter(Boolean),
  };
}

async function resolveTagIds(userId: string, tagNames: string[]): Promise<string[]> {
  const clean = Array.from(new Set(tagNames.map((n) => n.trim()).filter(Boolean)));
  if (clean.length === 0) return [];

  const { data: existingTags, error: fetchErr } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .in('name', clean);
  if (fetchErr) throw fetchErr;

  const existingNames = new Set((existingTags ?? []).map((t) => t.name.toLowerCase()));
  const toCreate = clean.filter((n) => !existingNames.has(n.toLowerCase()));

  let createdTags: Tag[] = [];
  if (toCreate.length > 0) {
    const { data, error } = await supabase
      .from('tags')
      .insert(toCreate.map((name) => ({ user_id: userId, name })))
      .select();
    if (error) throw error;
    createdTags = (data as Tag[]) || [];
  }

  return [...(existingTags ?? []), ...createdTags].map((t) => t.id);
}

async function setResourceTags(resourceId: string, userId: string, tagNames: string[]) {
  const tagIds = await resolveTagIds(userId, tagNames);

  const { error: deleteErr } = await supabase
    .from('resource_tags')
    .delete()
    .eq('resource_id', resourceId);
  if (deleteErr) throw deleteErr;

  if (tagIds.length > 0) {
    const { error: insertErr } = await supabase
      .from('resource_tags')
      .insert(tagIds.map((tag_id) => ({ resource_id: resourceId, tag_id })));
    if (insertErr) throw insertErr;
  }
}

const RESOURCE_SELECT = '*, resource_tags(tags(*))';

export const db = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsertProfile(profile: Profile): Promise<void> {
    const { error } = await supabase.from('profiles').upsert(profile);
    if (error) throw error;
  },

  // Tags
  async getTags(userId: string): Promise<(Tag & { count: number })[]> {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;

    const { data: counts, error: countErr } = await supabase
      .from('resource_tags')
      .select('tag_id, resources!inner(user_id)')
      .eq('resources.user_id', userId);
    if (countErr) throw countErr;

    const countByTag = new Map<string, number>();
    (counts ?? []).forEach((row: { tag_id: string }) => {
      countByTag.set(row.tag_id, (countByTag.get(row.tag_id) ?? 0) + 1);
    });

    return (tags ?? []).map((tag) => ({ ...tag, count: countByTag.get(tag.id) ?? 0 }));
  },

  async createTag(userId: string, name: string, color?: string): Promise<Tag> {
    const trimmed = name.trim();
    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', trimmed)
      .maybeSingle();
    if (existing) return existing;

    const { data, error } = await supabase
      .from('tags')
      .insert({ user_id: userId, name: trimmed, color: color || '#64748b' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTag(tagId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Resources
  async getResources(
    userId: string,
    options?: {
      search?: string;
      type?: ResourceType | 'All';
      tagId?: string;
      favoritesOnly?: boolean;
      sort?: 'newest' | 'oldest' | 'title' | 'updated';
    }
  ): Promise<Resource[]> {
    let query = supabase.from('resources').select(RESOURCE_SELECT).eq('user_id', userId);

    if (options?.favoritesOnly) {
      query = query.eq('is_favorite', true);
    }
    if (options?.type && options.type !== 'All') {
      query = query.eq('type', options.type);
    }
    if (options?.search) {
      const q = options.search.trim();
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,content.ilike.%${q}%,url.ilike.%${q}%`
      );
    }

    switch (options?.sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'title':
        query = query.order('title', { ascending: true });
        break;
      case 'updated':
        query = query.order('updated_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    let results = ((data as ResourceRow[]) || []).map(flattenResource);

    if (options?.tagId) {
      results = results.filter((r) => r.tags?.some((t) => t.id === options.tagId));
    }
    return results;
  },

  async getResource(id: string, userId: string): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .select(RESOURCE_SELECT)
      .eq('id', id)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .maybeSingle();
    if (error) throw error;
    return data ? flattenResource(data as ResourceRow) : null;
  },

  async createResource(
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
  ): Promise<Resource> {
    const { data: created, error } = await supabase
      .from('resources')
      .insert({
        user_id: userId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        url: data.url?.trim() || null,
        type: data.type,
        content: data.content?.trim() || null,
        language: data.language || null,
        mood: data.mood?.trim() || null,
        is_favorite: data.is_favorite ?? false,
        is_public: data.is_public ?? false,
        ...(data.created_at ? { created_at: data.created_at } : {}),
      })
      .select()
      .single();
    if (error) throw error;

    if (tagNames.length > 0) {
      await setResourceTags(created.id, userId, tagNames);
    }

    const full = await this.getResource(created.id, userId);
    return full as Resource;
  },

  async updateResource(
    id: string,
    userId: string,
    data: Partial<Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tags'>>,
    tagNames?: string[]
  ): Promise<Resource | null> {
    const { error } = await supabase
      .from('resources')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;

    if (tagNames !== undefined) {
      await setResourceTags(id, userId, tagNames);
    }

    return this.getResource(id, userId);
  },

  async deleteResource(id: string, userId: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('resources')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async toggleFavorite(id: string, userId: string): Promise<boolean> {
    const current = await this.getResource(id, userId);
    if (!current) return false;
    const next = !current.is_favorite;

    const { error } = await supabase
      .from('resources')
      .update({ is_favorite: next, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return next;
  },

  async togglePublic(id: string, userId: string): Promise<boolean> {
    const current = await this.getResource(id, userId);
    if (!current) return false;
    const next = !current.is_public;

    const { error } = await supabase
      .from('resources')
      .update({ is_public: next, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return next;
  },

  async getStats(userId: string) {
    const resources = await this.getResources(userId);
    const tags = await this.getTags(userId);
    const snippets = resources.filter((r) => r.type === 'Code Snippet').length;
    const notes = resources.filter((r) => r.type === 'Note').length;
    const diary = resources.filter((r) => r.type === 'Diary').length;
    const bookmarks = resources.filter((r) =>
      ['Bookmark', 'Article', 'Documentation'].includes(r.type)
    ).length;
    const favorites = resources.filter((r) => r.is_favorite).length;

    return {
      totalResources: resources.length,
      totalSnippets: snippets,
      totalNotes: notes,
      totalDiary: diary,
      totalBookmarks: bookmarks,
      totalFavorites: favorites,
      totalTags: tags.length,
    };
  },

  async resetDefaults(userId: string): Promise<void> {
    const { error: resErr } = await supabase.from('resources').delete().eq('user_id', userId);
    if (resErr) throw resErr;
    const { error: tagErr } = await supabase.from('tags').delete().eq('user_id', userId);
    if (tagErr) throw tagErr;
  },

  async exportDatabase(userId: string): Promise<string> {
    const resources = await this.getResources(userId);
    const tags = await this.getTags(userId);
    const profile = await this.getProfile(userId);

    const payload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      tags,
      resources,
    };
    return JSON.stringify(payload, null, 2);
  },

  // Read-only snapshot of live rows for Live Table Inspector
  async getLiveSnapshot(userId: string) {
    const resources = await this.getResources(userId);
    const tags = await this.getTags(userId);
    const resourceTags = resources.flatMap(
      (r) => r.tags?.map((t) => ({ resource_id: r.id, tag_id: t.id })) ?? []
    );
    return { resources, tags, resource_tags: resourceTags };
  },
};

// PostgreSQL Schema & RLS Blueprint
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
  color TEXT DEFAULT '#64748b',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- 4. Resource Tags Join Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.resource_tags (
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (resource_id, tag_id)
);

-- 5. Row Level Security (RLS) Policies (Supabase Auth)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view own profile or public profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Resource Policies
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

-- Tags Policies
CREATE POLICY "Users can manage own tags"
  ON public.tags FOR ALL
  USING (auth.uid() = user_id);

-- Resource Tags Policies
CREATE POLICY "Users can manage own resource tags"
  ON public.resource_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources
      WHERE id = resource_tags.resource_id AND user_id = auth.uid()
    )
  );
`;