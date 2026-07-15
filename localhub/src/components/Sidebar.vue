<template>
  <aside class="w-full md:w-[400px] lg:w-[480px] bg-white/80 backdrop-blur-md border-r border-border-subtle flex flex-col z-10 shadow-lg h-[512px] md:h-auto flex-shrink-0">
    <div class="p-6 border-b border-border-subtle bg-white/50 backdrop-blur-md">
      <div class="relative mb-4 flex items-center">
        <span class="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none select-none">search</span>
        <input v-model="queryText" class="w-full bg-surface-container-lowest/80 border border-border-subtle text-base rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-tourism-vibrant focus:ring-2 focus:ring-tourism-vibrant/20 transition-all shadow-inner" placeholder="장소, 커뮤니티 게시글 검색..." type="text" @input="$emit('search', queryText)"/>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-2 px-2">
        <button v-for="filter in filterOptions" :key="filter.value" :class="[activeFilter === filter.value ? 'bg-tourism-vibrant text-on-primary shadow-md scale-105' : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container-low']" class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200" @click="selectFilter(filter.value)">
          {{ filter.label }}
        </button>
      </div>
    </div>
    
    <div class="flex-grow overflow-y-auto custom-scrollbar p-6 bg-grid-pattern">
      <div v-if="selectedPlace" class="mb-5 bg-primary-container/10 border border-primary-container/20 rounded-2xl p-4 flex justify-between items-center text-xs shadow-sm backdrop-blur-sm animate-fade-in">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-tourism-vibrant text-base animate-bounce">location_on</span>
          <div>
            <span class="text-text-heading font-bold text-sm block">"{{ selectedPlace.title }}"</span>
            <span class="text-on-surface-variant text-[11px]">관련 피드만 탐색하고 있습니다.</span>
          </div>
        </div>
        <button class="text-white bg-tourism-vibrant px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-sm" @click="$emit('clear-place-filter')">전체보기</button>
      </div>

      <div class="flex items-center justify-between mb-5">
        <div class="text-xs font-bold text-text-heading flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-community-emerald animate-pulse"></span>
          실시간 피드 리스트
        </div>
        <button class="flex items-center gap-1 bg-community-emerald text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" @click="$emit('open-create-modal')">
          <span class="material-symbols-outlined text-sm">edit</span>
          소식 공유하기
        </button>
      </div>

      <div v-if="isLoading" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="'skeleton-' + i" class="bg-white/60 rounded-2xl p-4 border border-border-subtle animate-pulse flex flex-col gap-3">
          <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
          <div class="h-3 bg-slate-200 rounded-md w-full"></div>
          <div class="h-3 bg-slate-200 rounded-md w-1/2"></div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div 
          v-for="post in posts" 
          :key="post.id" 
          :class="[post.category === '맛집 / 카페' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-tourism-vibrant']"
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-border-subtle hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm flex flex-col gap-3" 
          @click="$emit('select-post', post)"
        >
          <div class="flex justify-between items-start">
            <h3 class="text-base font-bold text-text-heading line-clamp-1 group-hover:text-tourism-vibrant">{{ post.title }}</h3>
            <span class="bg-surface-container-low text-text-body text-[10px] font-bold px-2.5 py-1 rounded-full border border-border-subtle/50">{{ post.category }}</span>
          </div>
          <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{{ post.content }}</p>
          <div class="flex items-center justify-between text-xs text-on-surface-variant border-t border-border-subtle/50 pt-3 mt-1">
            <span class="font-medium">by <span class="text-text-heading font-semibold">{{ post.nickname }}</span></span>
            <div class="flex items-center gap-3 font-semibold">
              <span class="flex items-center gap-0.5 text-rose-500"><span class="material-symbols-outlined text-[15px] fill-rose-500">favorite</span>{{ post.likes }}</span>
              <span class="flex items-center gap-0.5 text-blue-500"><span class="material-symbols-outlined text-[15px] fill-blue-500">bookmark</span>{{ post.bookmarks }}</span>
            </div>
          </div>
        </div>
        <div v-if="posts.length === 0" class="text-center py-16 text-xs text-outline bg-white/40 border border-dashed border-border-subtle rounded-2xl">
          이 장소에 작성된 소식이 없습니다.<br/>첫 번째 유용한 게시글을 공유해 주세요!
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
defineProps({ 
  posts: { type: Array, required: true },
  selectedPlace: { type: Object, default: null },
  isLoading: { type: Boolean, default: false }
});
const emit = defineEmits(['search', 'filter-change', 'open-create-modal', 'select-post', 'clear-place-filter']);

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