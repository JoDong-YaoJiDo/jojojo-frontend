<template>
  <div class="flex gap-2 items-center">
    <input
      v-model="message"
      @keyup.enter="submit"
      class="flex-grow bg-slate-50 border border-border-subtle/50 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-tourism-vibrant focus:bg-white transition-colors placeholder:text-outline/50"
      placeholder="질문 창에 입력하세요."
      type="text"
    />
    <button 
      @click="submit"
      class="bg-tourism-vibrant text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-tourism-vibrant/90 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
    >
      <span class="material-symbols-outlined text-[18px]">send</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["send"]);
const message = ref("");

const submit = () => {
  if (!message.value.trim()) return;
  emit("send", message.value);
  message.value = "";
};
</script>