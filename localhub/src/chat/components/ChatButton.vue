<template>
  <button
    class="fixed right-6 bottom-6 w-14 h-14 bg-tourism-vibrant text-white rounded-full flex items-center justify-center shadow-lg shadow-tourism-vibrant/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none z-[9999]"
    @click="emit('click')"
  >
    <span class="material-symbols-outlined text-[24px]">chat_bubble</span>
  </button>
</template>

<script setup>
const emit = defineEmits(["click"]);
</script>