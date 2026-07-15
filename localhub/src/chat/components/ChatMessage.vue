<template>
  <div
    class="flex w-full mb-3"
    :class="role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[75%] px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap break-all"
      :class="[
        role === 'user'
          ? 'bg-tourism-vibrant text-white rounded-2xl rounded-tr-none'
          : 'bg-white border border-border-subtle/30 text-on-surface rounded-2xl rounded-tl-none'
      ]"
    >
      {{ content }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  role: { type: String, required: true },
  content: { type: String, required: true }
});
</script>