<script setup>

import { ref,nextTick } from "vue";

import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";

import { askChat } from "../api/chat";

const emit = defineEmits(["close"]);
const loading = ref(false);

const messages=ref([

{
role:"assistant",
content:"안녕하세요 😊 무엇을 도와드릴까요?"
}

]);

const bodyRef=ref(null);

function scrollBottom(){

nextTick(()=>{

bodyRef.value.scrollTop=
bodyRef.value.scrollHeight;

});

}

async function send(msg) {

  messages.value.push({
    role: "user",
    content: msg,
  });

  scrollBottom();

  loading.value = true;

  try {

    const res = await askChat(msg);

    messages.value.push({
      role: "assistant",
      content: res.answer,
    });

  } catch (e) {

    messages.value.push({
      role: "assistant",
      content: "죄송합니다. 현재 AI 서버에 연결할 수 없습니다.",
    });

    console.error(e);

  } finally {

    loading.value = false;

    scrollBottom();

  }

}

</script>

<template>

<div class="chat-window">

<div class="header">

<span>🤖 LocalHub AI</span>

<button @click="emit('close')">

✕

</button>

</div>

<div
  class="body"
  ref="bodyRef"
>
  <ChatMessage
    v-for="(m, i) in messages"
    :key="i"
    :role="m.role"
    :content="m.content"
  />

  <!-- 로딩 중일 때만 표시 -->
  <ChatMessage
    v-if="loading"
    role="assistant"
    content="답변을 생성하는 중입니다..."
  />
</div>

<div class="footer">

<ChatInput
@send="send"
/>

</div>

</div>

</template>

<style scoped>

.chat-window{

position:fixed;

right:24px;

bottom:100px;

width:380px;

height:600px;

background:white;

border-radius:20px;

display:flex;

flex-direction:column;

overflow:hidden;

box-shadow:0 10px 40px rgba(0,0,0,.2);

}

.header{

height:60px;

background:#4f46e5;

display:flex;

justify-content:space-between;

align-items:center;

padding:0 20px;

color:white;

}

.body{

flex:1;

overflow:auto;

padding:16px;

background:#fafafa;

}

.footer{

padding:12px;

border-top:1px solid #eee;

}

</style>