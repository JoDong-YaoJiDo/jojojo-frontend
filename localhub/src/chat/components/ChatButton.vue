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

  width: 64px;
  height: 64px;

  border: none;
  border-radius: 50%;

  background: #4f46e5;
  color: white;

  font-size: 28px;

  cursor: pointer;

  box-shadow: 0 8px 24px rgba(0,0,0,.2);

  transition: .2s;

  z-index:9999;
}

.chat-button:hover{
  transform:scale(1.08);
}
</style>