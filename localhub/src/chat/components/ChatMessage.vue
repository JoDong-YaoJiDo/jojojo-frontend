<script setup>
defineProps({
  role: String,
  content: String
})
</script>

<template>
  <div
    class="message"
    :class="role"
  >
    <div class="bubble">
      {{ content }}
    </div>
  </div>
</template>

<style scoped>

.message{
  display:flex;
  margin:12px 0;
}

.message.user{
  justify-content:flex-end;
}

.message.assistant{
  justify-content:flex-start;
}

.bubble{

  max-width:70%;

  padding:12px 16px;

  border-radius:18px;

  word-break:break-word;

}

.user .bubble{

  background:#4f46e5;
  color:white;

}

.assistant .bubble{

  background:#f1f5f9;

}

</style>