import React, { useCallback, useEffect, useState } from 'react';
import {
  AllResourcesView,
} from './components/AllResourcesView';
import { CodeSnippetsView } from './components/CodeSnippetsView';
import { CommandPalette } from './components/CommandPalette';
import { DashboardView } from './components/DashboardView';
import { DiaryView } from './components/DiaryView';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { NotesView } from './components/NotesView';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ResourceModal } from './components/ResourceModal';
import { SchemaGuideModal } from './components/SchemaGuideModal';
import { Sidebar } from './components/Sidebar';
import { TagsView } from './components/TagsView';
import { AuthProvider, useAuth } from './lib/auth';
import { db } from './lib/storage';
import { Resource, ResourceType, SortOption, Tag, ViewMode } from './types';

function VaultMain() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<ResourceType | 'All'>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals state
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [defaultModalType, setDefaultModalType] = useState<ResourceType>('Bookmark');
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSchemaGuideOpen, setIsSchemaGuideOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Remote data state — replaces the old synchronous localStorage reads.
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [allUserResources, setAllUserResources] = useState<Resource[]>([]);
  const [viewResources, setViewResources] = useState<Resource[]>([]);
  const [availableTags, setAvailableTags] = useState<(Tag & { count: number })[]>([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalSnippets: 0,
    totalNotes: 0,
    totalDiary: 0,
    totalBookmarks: 0,
    totalFavorites: 0,
    totalTags: 0,
  });
  const [dataVersion, setDataVersion] = useState(0);

  // Base data: everything the user owns, plus tags and stats.
  // Re-fetched whenever the signed-in user changes or a mutation bumps dataVersion.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsDataLoading(true);

    Promise.all([db.getResources(user.id), db.getTags(user.id), db.getStats(user.id)])
      .then(([resources, tags, statsResult]) => {
        if (cancelled) return;
        setAllUserResources(resources);
        setAvailableTags(tags);
        setStats(statsResult);
      })
      .catch((err) => console.error('Failed to load Vault data', err))
      .finally(() => {
        if (!cancelled) setIsDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, dataVersion]);

  // Filtered view: re-fetched whenever the active filters change (separately
  // from the base data above, since it needs its own query).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    db.getResources(user.id, {
      search: searchQuery || undefined,
      type: currentView === 'favorites' ? 'All' : selectedType,
      tagId: selectedTag ? availableTags.find((t) => t.name === selectedTag)?.id : undefined,
      favoritesOnly: currentView === 'favorites' || favoritesOnly,
      sort: sortOption,
    })
      .then((results) => {
        if (!cancelled) setViewResources(results);
      })
      .catch((err) => console.error('Failed to load filtered resources', err));

    return () => {
      cancelled = true;
    };
  }, [user, searchQuery, currentView, selectedType, selectedTag, favoritesOnly, sortOption, availableTags, dataVersion]);

  const refresh = useCallback(() => setDataVersion((v) => v + 1), []);

  // Keyboard shortcut listeners (Cmd+K, N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isInput && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleOpenCreateModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A1A1A1] font-mono text-xs">
        Loading Vault session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LandingPage onEnterApp={() => setCurrentView('dashboard')} />;
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A1A1A1] font-mono text-xs">
        Loading your resources...
      </div>
    );
  }

  const notesList = allUserResources.filter((r) => r.type === 'Note');
  const snippetsList = allUserResources.filter((r) => r.type === 'Code Snippet');
  const diaryList = allUserResources.filter((r) => r.type === 'Diary');

  // Modal Open Handlers
  const handleOpenCreateModal = (type: ResourceType = 'Bookmark') => {
    setEditingResource(null);
    setDefaultModalType(type);
    setIsResourceModalOpen(true);
  };

  const handleOpenEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setDefaultModalType(resource.type);
    setIsResourceModalOpen(true);
  };

  const handleOpenDetails = (resource: Resource) => {
    setDetailResource(resource);
    setIsDetailModalOpen(true);
  };

  // CRUD handlers
  const handleSaveResource = async (
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
  ) => {
    try {
      if (editingResource) {
        await db.updateResource(editingResource.id, user.id, data, tagNames);
      } else {
        await db.createResource(user.id, data, tagNames);
      }
      refresh();
    } catch (err) {
      console.error('Failed to save resource', err);
      throw err;
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await db.deleteResource(id, user.id);
        if (detailResource?.id === id) {
          setIsDetailModalOpen(false);
        }
        refresh();
      } catch (err) {
        console.error('Failed to delete resource', err);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await db.toggleFavorite(id, user.id);
      if (detailResource?.id === id) {
        const refreshed = await db.getResource(id, user.id);
        setDetailResource(refreshed);
      }
      refresh();
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleTogglePublic = async (id: string) => {
    try {
      await db.togglePublic(id, user.id);
      if (detailResource?.id === id) {
        const refreshed = await db.getResource(id, user.id);
        setDetailResource(refreshed);
      }
      refresh();
    } catch (err) {
      console.error('Failed to toggle public', err);
    }
  };

  const handleCreateTag = async (name: string, color?: string) => {
    try {
      await db.createTag(user.id, name, color);
      refresh();
    } catch (err) {
      console.error('Failed to create tag', err);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Delete this tag? Associated resources will not be deleted.')) {
      try {
        await db.deleteTag(id, user.id);
        if (selectedTag) setSelectedTag(undefined);
        refresh();
      } catch (err) {
        console.error('Failed to delete tag', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] flex flex-row selection:bg-[#262626] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedTag(undefined);
        }}
        tags={availableTags}
        selectedTag={selectedTag}
        onSelectTag={(tagName) => setSelectedTag(tagName)}
        onOpenCreateModal={() => handleOpenCreateModal()}
        onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        totalCounts={{
          all: stats.totalResources,
          favorites: stats.totalFavorites,
          notes: stats.totalNotes,
          snippets: stats.totalSnippets,
          diary: stats.totalDiary,
          tags: stats.totalTags,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Top Navbar */}
        <Navbar
          currentView={currentView}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCreateModal={() => handleOpenCreateModal()}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
          selectedTag={selectedTag}
          onClearSelectedTag={() => setSelectedTag(undefined)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Routing */}
        <main className="flex-1 pb-16">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentResources={allUserResources}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={setCurrentView}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
              onTagClick={(tagName) => {
                setSelectedTag(tagName);
                setCurrentView('all');
              }}
            />
          )}

          {(currentView === 'all' || currentView === 'favorites') && (
            <AllResourcesView
              resources={viewResources}
              availableTags={availableTags}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              favoritesOnly={currentView === 'favorites' || favoritesOnly}
              onToggleFavoritesOnly={() => setFavoritesOnly(!favoritesOnly)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
              onOpenCreateModal={() => handleOpenCreateModal()}
            />
          )}

          {currentView === 'diary' && (
            <DiaryView
              entries={diaryList}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
              onOpenCreateDiary={() => handleOpenCreateModal('Diary')}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notesList}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
              onOpenCreateNote={() => handleOpenCreateModal('Note')}
            />
          )}

          {currentView === 'snippets' && (
            <CodeSnippetsView
              snippets={snippetsList}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
              onOpenCreateSnippet={() => handleOpenCreateModal('Code Snippet')}
            />
          )}

          {currentView === 'tags' && (
            <TagsView
              tags={availableTags}
              resources={allUserResources}
              onCreateTag={handleCreateTag}
              onDeleteTag={handleDeleteTag}
              onSelectTag={(tagName) => {
                setSelectedTag(tagName);
                setCurrentView('all');
              }}
              onOpenDetails={handleOpenDetails}
              onEdit={handleOpenEditModal}
              onDeleteResource={handleDeleteResource}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentView === 'schema-guide' && (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto">
              {/* Trigger the modal and return to dashboard */}
              <button
                onClick={() => setIsSchemaGuideOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Open Schema Guide
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Resource Modal (Create & Edit) */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSave={handleSaveResource}
        initialData={editingResource}
        availableTags={availableTags}
        defaultType={defaultModalType}
      />

      {/* Resource Details Modal */}
      <ResourceDetailModal
        resource={detailResource}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteResource}
        onToggleFavorite={handleToggleFavorite}
        onTogglePublic={handleTogglePublic}
        onTagClick={(tag) => {
          setSelectedTag(tag);
          setCurrentView('all');
        }}
      />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        resources={allUserResources}
        onSelectResource={handleOpenDetails}
        onNavigate={(view) => {
          if (view === 'schema-guide') {
            setIsSchemaGuideOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Database Schema & RLS Educational Blueprint Modal */}
      <SchemaGuideModal
        isOpen={isSchemaGuideOpen}
        onClose={() => setIsSchemaGuideOpen(false)}
        userId={user.id}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VaultMain />
    </AuthProvider>
  );
}