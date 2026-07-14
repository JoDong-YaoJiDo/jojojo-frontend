<template>
  <aside class="w-full md:w-[400px] lg:w-[480px] bg-surface-card border-r border-border-subtle flex flex-col z-10 shadow-sm h-[512px] md:h-auto flex-shrink-0">
    <div class="p-6 border-b border-border-subtle bg-surface-bright/50 backdrop-blur-md">
      <div class="relative mb-4 flex items-center">
        <span class="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none select-none">search</span>
        <input 
          v-model="queryText" 
          class="w-full bg-surface-container-lowest border border-border-subtle text-base rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-tourism-vibrant focus:ring-1 focus:ring-tourism-vibrant transition-shadow" 
          placeholder="장소, 커뮤니티 게시글 검색..." 
          type="text" 
          @input="$emit('search', queryText)"
        />
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-2 px-2">
        <button v-for="filter in filterOptions" :key="filter.value" :class="[activeFilter === filter.value ? 'bg-tourism-vibrant text-on-primary' : 'bg-surface-container-lowest border border-border-subtle text-on-surface-variant']" class="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors" @click="selectFilter(filter.value)">
          {{ filter.label }}
        </button>
      </div>
    </div>
    
    <div class="flex-grow overflow-y-auto custom-scrollbar p-6 bg-background-page">
      <div class="flex items-center justify-between mb-4">
        <div class="text-xs font-medium text-on-surface-variant">지역 실시간 익명 피드</div>
        <button class="flex items-center gap-1 bg-community-emerald text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm" @click="$emit('open-create-modal')">
          <span class="material-symbols-outlined text-sm">edit</span>
          소식 공유하기
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div v-for="post in posts" :key="post.id" class="bg-surface-card rounded-xl p-4 border border-border-subtle hover:border-community-emerald/50 hover:shadow-md transition-all cursor-pointer shadow-sm" @click="$emit('select-post', post)">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-base font-semibold text-text-heading line-clamp-1">{{ post.title }}</h3>
            <span class="bg-surface-container text-community-emerald text-[10px] font-bold px-2 py-0.5 rounded">{{ post.category }}</span>
          </div>
          <p class="text-xs text-on-surface-variant line-clamp-2 mb-2">{{ post.content }}</p>
          <div class="flex items-center justify-between text-xs text-on-surface-variant">
            <span>by {{ post.nickname }}</span>
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">favorite</span>{{ post.likes }}</span>
              <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">bookmark</span>{{ post.bookmarks }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
defineProps({ posts: { type: Array, required: true } });
const emit = defineEmits(['search', 'filter-change', 'open-create-modal', 'select-post']);

const queryText = ref('');
const activeFilter = ref('all');
const filterOptions = [
  { label: '전체보기', value: 'all' },
  { label: '관광 명소', value: 'attraction' },
  { label: '맛집 / 카페', value: 'restaurant' }
];

const selectFilter = (value) => {
  activeFilter.value = value;
  emit('filter-change', value);
};
</script>