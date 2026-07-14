<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-surface-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-border-subtle flex flex-col max-h-[85vh]">
      <div class="p-6 border-b border-border-subtle flex justify-between items-center bg-background-page">
        <div>
          <span class="text-[10px] uppercase tracking-wider font-bold text-community-emerald bg-emerald-50 px-2 py-0.5 rounded">{{ post.category }}</span>
          <h2 class="text-base font-bold text-text-heading mt-1">{{ post.title }}</h2>
        </div>
        <button class="text-on-surface-variant hover:bg-surface-container rounded-full p-1" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
        <div class="text-xs text-on-surface-variant flex items-center justify-between border-b border-border-subtle pb-2">
          <span>작성자: <b>{{ post.nickname }}</b></span>
          <div class="flex gap-2">
            <button class="flex items-center gap-1 border border-border-subtle px-2 py-1 rounded-md hover:bg-surface-container-low" @click="$emit('like', post.id)">
              <span class="material-symbols-outlined text-sm text-red-500">favorite</span> 추천 {{ post.likes }}
            </button>
            <button class="flex items-center gap-1 border border-border-subtle px-2 py-1 rounded-md hover:bg-surface-container-low" @click="$emit('bookmark', post.id)">
              <span class="material-symbols-outlined text-sm text-yellow-500">bookmark</span> 북마크
            </button>
          </div>
        </div>

        <p class="text-sm text-text-body leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>

        <div class="border-t border-border-subtle pt-4">
          <h4 class="text-xs font-bold text-text-heading mb-3 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">maps_ugc</span> 댓글 ({{ post.comments.length }})
          </h4>
          <div class="flex flex-col gap-2 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar">
            <div v-for="comment in post.comments" :key="comment.id" class="bg-surface-container-low p-3 rounded-lg text-xs">
              <div class="font-bold text-text-heading mb-1">{{ comment.nickname }}</div>
              <p class="text-on-surface-variant">{{ comment.content }}</p>
            </div>
            <div v-if="post.comments.length === 0" class="text-center text-xs text-outline py-4">등록된 댓글이 없습니다. 첫 소식을 남겨보세요.</div>
          </div>

          <form class="flex flex-col gap-2 border border-border-subtle p-3 rounded-xl bg-background-page" @submit.prevent="submitComment">
            <div class="flex gap-2">
              <input v-model="commentForm.nickname" type="text" placeholder="익명 닉네임" required class="border border-border-subtle bg-surface-card rounded px-2 py-1 text-xs w-1/3 focus:outline-none"/>
            </div>
            <div class="flex gap-2">
              <input v-model="commentForm.content" type="text" placeholder="댓글 내용을 입력하세요..." required class="border border-border-subtle bg-surface-card rounded px-3 py-1.5 text-xs flex-grow focus:outline-none"/>
              <button type="submit" class="bg-text-heading text-white px-3 py-1.5 rounded text-xs font-semibold">등록</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({ post: { type: Object, required: true }, clientId: { type: String, required: true } });
const emit = defineEmits(['close', 'like', 'bookmark', 'add-comment']);

const commentForm = ref({ nickname: '', content: '', parent_id: null });

const submitComment = () => {
  emit('add-comment', {
    postId: props.post.id,
    commentData: { ...commentForm.value }
  });
  commentForm.value.content = '';
};
</script>