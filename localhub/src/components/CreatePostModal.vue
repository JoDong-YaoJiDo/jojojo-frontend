<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-surface-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border-subtle flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-border-subtle flex justify-between items-center">
        <h2 class="text-lg font-bold text-text-heading flex items-center gap-2">
          <span class="material-symbols-outlined text-community-emerald">edit_note</span>익명 소식 작성
        </h2>
        <button class="text-on-surface-variant hover:bg-surface-container rounded-full p-1" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <form class="p-6 overflow-y-auto flex-grow flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">닉네임 *</label>
          <input v-model="form.nickname" type="text" required class="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tourism-vibrant" placeholder="익명 닉네임 입력"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">비밀번호 *</label>
          <input v-model="form.password" type="password" required class="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tourism-vibrant" placeholder="수정/삭제용 비밀번호"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">글 제목 *</label>
          <input v-model="form.title" type="text" required class="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tourism-vibrant" placeholder="제목을 입력하세요"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">본문 내용 *</label>
          <textarea v-model="form.content" required rows="4" class="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tourism-vibrant resize-none" placeholder="이 장소에 대한 유용한 정보를 공유해 주세요."></textarea>
        </div>
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">태그 (선택)</label>
          <input v-model="form.tags" type="text" class="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tourism-vibrant" placeholder="쉼표(,)로 구분하여 입력"/>
        </div>
        
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-border-subtle">
          <button type="button" class="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg text-sm" @click="$emit('close')">취소</button>
          <button type="submit" class="px-4 py-2 bg-tourism-vibrant text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-600">등록하기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const emit = defineEmits(['close', 'submit']);

const form = ref({
  title: '',
  content: '',
  nickname: '',
  password: '',
  tags: ''
});

const handleSubmit = () => {
  const formData = new FormData();
  formData.append('title', form.value.title);
  formData.append('content', form.value.content);
  formData.append('nickname', form.value.nickname);
  formData.append('password', form.value.password);
  formData.append('tags', form.value.tags);
  
  emit('submit', formData);
};
</script>