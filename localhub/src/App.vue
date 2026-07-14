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

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import MapArea from './components/MapArea.vue';
import CreatePostModal from './components/CreatePostModal.vue';
import PostDetailModal from './components/PostDetailModal.vue';

const currentTab = ref('explore');
const clientId = ref('');
const isCreateModalOpen = ref(false);
const selectedPost = ref(null);

const posts = ref([]);
const tourismPlaces = ref([]);

// 고유 식별값(client_id) 할당 로직
const initSession = () => {
  let id = localStorage.getItem('local_connect_client_id');
  if (!id) {
    id = 'client_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('local_connect_client_id', id);
  }
  clientId.value = id;
};

const loadData = () => {
  posts.value = [
    { id: 1, title: '경복궁 야간 개장 다녀왔어요!', content: '조명이 너무 예뻤어요. 예매 팁 하나 공유하자면 꼭 한복 입고 가세요!', nickname: '익명 사용자', likes: 24, bookmarks: 5, category: '관광 명소', comments: [], mapx: 126.9768, mapy: 37.5776 },
    { id: 2, title: '해운대 근처 숨겨진 국밥집', content: '바닷가 쪽 말고 골목 안쪽으로 들어가면 현지인들만 아는 찐 국밥집 있어요.', nickname: '부산토박이', likes: 56, bookmarks: 12, category: '맛집 / 카페', comments: [], mapx: 129.1586, mapy: 35.1587 }
  ];

  tourismPlaces.value = [
    { id: 101, title: '경복궁', mapx: 126.9768, mapy: 37.5776, content_type: '관광 명소' },
    { id: 102, title: '해운대 해수욕장', mapx: 129.1586, mapy: 35.1587, content_type: '관광 명소' }
  ];
};

const handleSearch = (q) => { console.log('검색 쿼리 실행 (GET /api/posts/search?q=):', q); };
const handleFilterChange = (filter) => { console.log('필터 변경:', filter); };
const handleSelectPost = (post) => { selectedPost.value = post; };

const submitPost = (formData) => {
  // POST /api/posts (multipart/form-data) 요청 처리 모킹
  const newPost = {
    id: posts.value.length + 1,
    title: formData.get('title'),
    content: formData.get('content'),
    nickname: formData.get('nickname'),
    likes: 0,
    bookmarks: 0,
    category: '일반',
    comments: [],
    mapx: 126.9768 + (Math.random() - 0.5) * 0.02,
    mapy: 37.5776 + (Math.random() - 0.5) * 0.02
  };
  posts.value.unshift(newPost);
  isCreateModalOpen.value = false;
};

const handleLike = (postId) => {
  // POST /api/posts/{post_id}/like?client_id=
  const post = posts.value.find(p => p.id === postId);
  if (post) post.likes++;
};

const handleBookmark = (postId) => {
  // POST /api/posts/{post_id}/bookmark?client_id=
  const post = posts.value.find(p => p.id === postId);
  if (post) post.bookmarks++;
};

const handleCommentSubmit = ({ postId, commentData }) => {
  // POST /api/posts/{post_id}/comments
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.comments.push({
      id: post.comments.length + 1,
      nickname: commentData.nickname,
      content: commentData.content,
      parent_id: commentData.parent_id
    });
  }
};

onMounted(() => {
  initSession();
  loadData();
});
</script>