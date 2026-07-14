<template>
  <div class="bg-background-page text-on-surface h-screen flex flex-col overflow-hidden">
    <header class="bg-surface-bright shadow-sm border-b border-border-subtle full-width top-0 z-50 flex-shrink-0">
      <div class="flex justify-between items-center w-full px-4 md:px-8 max-w-[1280px] mx-auto h-16">
        <div class="text-2xl font-bold text-tourism-vibrant flex items-center gap-2">
          <span class="material-symbols-outlined">map_search</span>
          LocalHub
        </div>
        <nav class="hidden md:flex gap-6 h-full items-center">
          <a href="#" :class="[currentTab === 'explore' ? 'text-tourism-vibrant font-bold border-b-2 border-tourism-vibrant' : 'text-on-surface-variant hover:text-tourism-vibrant']" class="transition-colors text-base h-full flex items-center pt-0.5" @click.prevent="currentTab = 'explore'">지도 탐색</a>
          <a href="#" :class="[currentTab === 'chat' ? 'text-tourism-vibrant font-bold border-b-2 border-tourism-vibrant' : 'text-on-surface-variant hover:text-tourism-vibrant']" class="transition-colors text-base h-full flex items-center pt-0.5" @click.prevent="currentTab = 'chat'">AI 가이드</a>
        </nav>
        <div class="flex items-center gap-2 text-xs bg-surface-container-low px-3 py-1.5 rounded-full border border-border-subtle">
          <span class="w-2 h-2 rounded-full bg-community-emerald animate-pulse"></span>
          <span class="text-on-surface-variant font-mono">ID: {{ clientId.substring(0, 8) }}...</span>
        </div>
      </div>
    </header>

    <main class="flex-grow flex flex-col md:flex-row overflow-hidden relative">
      <Sidebar 
        :posts="posts" 
        @search="handleSearch" 
        @filter-change="handleFilterChange" 
        @open-create-modal="isCreateModalOpen = true"
        @select-post="handleSelectPost"
      />
      <MapArea 
        :tourism-places="tourismPlaces" 
        :posts="posts" 
        :selected-post="selectedPost"
        @marker-click="handleSelectPost"
      />
    </main>

    <nav class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 shadow-lg bg-surface-container-lowest rounded-t-xl">
      <a class="flex flex-col items-center justify-center text-on-surface-variant w-16 h-12" href="#" @click.prevent="currentTab = 'explore'">
        <span class="material-symbols-outlined mb-1">map</span>
        <span class="text-xs">탐색</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant w-16 h-12" href="#" @click.prevent="isCreateModalOpen = true">
        <span class="material-symbols-outlined mb-1">edit_square</span>
        <span class="text-xs">글쓰기</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant w-16 h-12" href="#" @click.prevent="currentTab = 'chat'">
        <span class="material-symbols-outlined mb-1">smart_toy</span>
        <span class="text-xs">챗봇</span>
      </a>
    </nav>

    <CreatePostModal 
      v-if="isCreateModalOpen" 
      :client-id="clientId"
      @close="isCreateModalOpen = false" 
      @submit="submitPost"
    />

    <PostDetailModal 
      v-if="selectedPost" 
      :post="selectedPost" 
      :client-id="clientId"
      @close="selectedPost = null"
      @like="handleLike"
      @bookmark="handleBookmark"
      @add-comment="handleCommentSubmit"
    />
  </div>
</template>

<style scoped></style>
