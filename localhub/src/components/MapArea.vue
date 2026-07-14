<template>
  <div class="flex-grow relative bg-[#eff4ff] h-[512px] md:h-auto z-0">
    <div class="absolute left-6 top-6 bg-surface-card/90 backdrop-blur px-4 py-2 rounded-xl shadow-md border border-border-subtle z-10 text-xs font-medium text-text-heading flex items-center gap-2">
      <span class="material-symbols-outlined text-tourism-vibrant text-sm">location_on</span>
      <span>서울 중심 영역 탐색 중</span>
    </div>

    <div 
      v-for="post in posts" 
      :key="'post-pin-' + post.id"
      :style="{ top: '40%', left: post.id === 1 ? '45%' : '60%' }" 
      class="absolute -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform origin-bottom group/pin z-20"
      @click="$emit('marker-click', post)"
    >
      <div :class="[selectedPost && selectedPost.id === post.id ? 'bg-community-emerald ring-4 ring-emerald-100' : 'bg-tourism-vibrant']" class="text-on-primary rounded-full px-3 py-1.5 shadow-md flex items-center gap-1 mb-1 transition-all">
        <span class="material-symbols-outlined text-[16px]">chat_bubble</span>
        <span class="text-xs font-bold whitespace-nowrap">{{ post.nickname }}의 제보</span>
      </div>
      <div :class="[selectedPost && selectedPost.id === post.id ? 'border-t-community-emerald' : 'border-t-tourism-vibrant']" class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto transition-colors"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  posts: { type: Array, default: () => [] },
  tourismPlaces: { type: Array, default: () => [] },
  selectedPost: { type: Object, default: null }
});
defineEmits(['marker-click']);
</script>