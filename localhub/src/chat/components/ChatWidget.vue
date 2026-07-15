<template>
  <ChatButton @click="toggleChat" />
  <ChatWindow
    v-if="isOpen"
    :current-region-label="currentRegionLabel"
    @close="closeChat"
  />
</template>

<script setup>
import { ref } from "vue";
import ChatButton from "./ChatButton.vue";
import ChatWindow from "./ChatWindow.vue";

defineProps({
  currentRegionLabel: { type: String, default: "전국" }
});

const isOpen = ref(false);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const closeChat = () => {
  isOpen.value = false;
};
</script>