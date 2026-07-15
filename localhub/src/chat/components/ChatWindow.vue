<template>
  <div class="fixed right-6 bottom-24 w-[360px] h-[560px] bg-white border border-border-subtle/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] animate-dropdown-fade">
    <div class="h-14 bg-white border-b border-border-subtle/50 flex items-center justify-between px-4 flex-shrink-0">
      <div class="flex items-center gap-2 text-on-surface text-sm font-bold select-none">
        <span class="material-symbols-outlined text-tourism-vibrant text-[20px]">explore</span>
        <span>로컬 길잡이</span>
      </div>
      <button
        class="text-outline hover:text-on-surface flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none"
        @click="emit('close')"
      >
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>

    <div
      class="flex-grow overflow-y-auto p-4 bg-slate-50/50"
      ref="bodyRef"
    >
      <div
        v-if="messages.length === 1"
        class="flex flex-col gap-1.5 mb-4"
      >
        <button 
          v-for="action in quickActions" 
          :key="action.text"
          @click="send(action.query)"
          class="w-full text-left bg-white border border-border-subtle/50 text-on-surface-variant hover:border-tourism-vibrant hover:bg-tourism-vibrant/5 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <span class="material-symbols-outlined text-[16px] text-tourism-vibrant">{{ action.icon }}</span>
          <span>{{ action.text }}</span>
        </button>
      </div>

      <ChatMessage
        v-for="(m, i) in messages"
        :key="i"
        :role="m.role"
        :content="m.content"
      />

      <div 
        v-if="loading" 
        class="flex justify-start mb-3"
      >
        <div class="bg-white border border-border-subtle/30 text-outline px-4 py-2.5 rounded-2xl rounded-tl-none text-sm font-medium flex items-center gap-2 shadow-sm">
          <div class="animate-spin-custom w-3 h-3 border-2 border-tourism-vibrant border-top-color-transparent rounded-full"></div>
          <span>답변 생성 중...</span>
        </div>
      </div>
    </div>

    <div class="p-3 border-top border-border-subtle/50 bg-white flex-shrink-0">
      <ChatInput @send="send" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch } from "vue";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import { askChat } from "../api/chat";

const props = defineProps({
  currentRegionLabel: { type: String, default: "전국" }
});

const emit = defineEmits(["close"]);
const loading = ref(false);
const bodyRef = ref(null);
const messages = ref([]);

const quickActions = computed(() => [
  { 
    text: `${props.currentRegionLabel} 쇼핑할 곳 추천`, 
    query: `${props.currentRegionLabel} 쇼핑할 곳 추천`, 
    icon: 'shopping_bag' 
  },
  { 
    text: `${props.currentRegionLabel} 여행코스 추천`, 
    query: `${props.currentRegionLabel} 여행코스 추천`, 
    icon: 'route' 
  },
  { 
    text: `${props.currentRegionLabel} 관광지 추천`, 
    query: `${props.currentRegionLabel} 관광지 추천`, 
    icon: 'tour' 
  },
  { 
    text: '커뮤니티 인기글 보여줘', 
    query: '커뮤니티 인기글 보여줘', 
    icon: 'forum' 
  }
]);

const scrollBottom = () => {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
  });
};

const send = async (msg) => {
  messages.value.push({ role: "user", content: msg });
  scrollBottom();
  loading.value = true;

  try {
    const res = await askChat(msg);
    messages.value.push({ role: "assistant", content: res.answer });
  } catch (e) {
    messages.value.push({
      role: "assistant",
      content: "현재 AI 인터페이스 연결에 장애가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
    console.error(e);
  } finally {
    loading.value = false;
    scrollBottom();
  }
};

watch(() => props.currentRegionLabel, (newLabel) => {
  messages.value = [
    {
      role: "assistant",
      content: `안녕하세요. ${newLabel} 로컬 인텔리전트 가이드입니다. 무엇을 도와드릴까요?`,
    }
  ];
}, { immediate: true });
</script>