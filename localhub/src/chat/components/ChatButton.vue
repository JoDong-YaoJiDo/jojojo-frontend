<script setup>
const emit = defineEmits(["click"]);
</script>

<template>
  <button
    class="chat-button"
    @click="emit('click')"
  >
    💬
  </button>
</template>

<style scoped>
.chat-button {
  position: fixed;
  right: 24px;
  bottom: 24px;

  width: 58px;
  height: 58px;

  border: none;
  border-radius: 50%;

  background: #22c55e;
  color: white;

  font-size: 24px;
  cursor: pointer;

  box-shadow: 0 8px 20px rgba(34, 197, 94, .35);

  z-index: 9999;
}

.chat-button:hover{
  transform:scale(1.08);
}
</style>