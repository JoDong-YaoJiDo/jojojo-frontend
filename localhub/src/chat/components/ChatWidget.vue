<script setup>
import { ref } from "vue";

import ChatButton from "./ChatButton.vue";
import ChatWindow from "./ChatWindow.vue";

const isOpen = ref(false);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const closeChat = () => {
  isOpen.value = false;
};
</script>

<template>
  <ChatButton @click="toggleChat" />

  <ChatWindow
    v-if="isOpen"
    @close="closeChat"
  />
</template>