<script setup>
import { ref, nextTick } from "vue";

import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import { askChat } from "../api/chat";

const emit = defineEmits(["close"]);

const loading = ref(false);

const messages = ref([
  {
    role: "assistant",
    content:
      "👋 안녕하세요!\n\n부산 관광 AI입니다.\n원하는 내용을 선택하거나 질문을 입력해주세요.",
  },
]);

const bodyRef = ref(null);

function scrollBottom() {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
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
    <!-- Header -->
    <div class="header">
      <div class="header-title">
        <span class="material-symbols-outlined">
          smart_toy
        </span>

        <span>AI Local Expert</span>
      </div>

      <button
        class="close-btn"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- Body -->
    <div
      class="body"
      ref="bodyRef"
    >
      <!-- 추천 질문 -->
      <div
        v-if="messages.length === 1"
        class="quick-actions"
      >
        <button @click="send('부산 맛집 추천')">
          🍜 맛집 추천
        </button>

        <button @click="send('부산 축제 일정')">
          🎉 축제 일정
        </button>

        <button @click="send('부산 관광 명소 추천')">
          📍 관광 명소
        </button>

        <button @click="send('커뮤니티 인기글 보여줘')">
          📝 커뮤니티 검색
        </button>
      </div>

      <ChatMessage
        v-for="(m, i) in messages"
        :key="i"
        :role="m.role"
        :content="m.content"
      />

      <ChatMessage
        v-if="loading"
        role="assistant"
        content="답변을 생성하는 중입니다..."
      />
    </div>

    <!-- Footer -->
    <div class="footer">
      <ChatInput @send="send" />
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  position: fixed;
  right: 24px;
  bottom: 96px;

  width: 360px;
  height: 560px;

  background: white;

  border-radius: 18px;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  box-shadow: 0 12px 35px rgba(0, 0, 0, .18);

  z-index: 9999;
}

.header {
  height: 56px;

  background: #4F8EF7;

  color: white;

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 0 16px;
}

.header-title {
  display: flex;

  align-items: center;

  gap: 8px;

  font-weight: 600;

  font-size: 15px;
}

.close-btn {
  background: transparent;

  border: none;

  color: white;

  cursor: pointer;

  font-size: 18px;
}

.body {
  flex: 1;

  overflow-y: auto;

  padding: 16px;

  background: #F7F9FC;
}

.quick-actions {
  display: flex;

  flex-wrap: wrap;

  gap: 8px;

  margin-bottom: 18px;
}

.quick-actions button {
  background: #EAFBF6;

  color: #16a34a;

  border: 1px solid #BBF7D0;

  border-radius: 18px;

  padding: 8px 12px;

  font-size: 12px;

  cursor: pointer;

  transition: .2s;
}

.quick-actions button:hover {
  background: #DCFCE7;
}

.footer {
  padding: 12px;

  border-top: 1px solid #e5e7eb;

  background: white;
}
</style>