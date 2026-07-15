<template>
  <section :class="sheetClasses" @click="handleSheetClick">
    <div 
      class="w-12 h-1.5 bg-on-surface/10 rounded-full mx-auto mt-3 mb-2 flex-shrink-0 cursor-pointer hover:bg-on-surface/30 transition-colors"
      @click.stop="$emit('toggle-expand')"
    ></div>

    <Transition :name="transitionName" mode="out-in">
      <div v-if="currentView === 'feed'" key="feed" class="flex-grow flex flex-col overflow-hidden">
        <div v-if="selectedPlace" class="sticky top-0 z-30 bg-transparent px-6 md:px-8 border-b border-on-surface/5 min-h-[200px] pt-2">
          <div class="flex items-center gap-4">
            <div class="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden shadow-xl group">
              <img :src="selectedPlace.image" :alt="selectedPlace.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2.5 py-1 bg-tourism-vibrant text-white text-[10px] font-bold rounded uppercase shadow-lg">추천 명소</span>
                  <div class="flex items-center bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white font-bold gap-0.5 text-xs">
                    <span class="material-symbols-outlined text-[14px] fill-1">star</span>
                    <span>{{ selectedPlace.rating }}</span>
                  </div>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">{{ selectedPlace.title }}</h1>
                <div class="flex items-center gap-1.5 text-xs text-white/80">
                  <span class="material-symbols-outlined text-[16px]">location_on</span>
                  <span>{{ selectedPlace.addr1 }}</span>
                </div>
              </div>
              
              <div class="absolute top-4 right-4 hidden md:flex flex-col items-end gap-2">
                <button 
                  class="bg-community-emerald text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2" 
                  @click.stop="handleWriteClick"
                >
                  <span class="material-symbols-outlined text-[18px]">edit_square</span>
                  <span>이야기 남기기</span>
                </button>
              </div>
              
              <button 
                class="md:hidden absolute top-4 right-4 w-10 h-10 bg-community-emerald text-white rounded-full flex items-center justify-center shadow-lg" 
                @click.stop="handleWriteClick"
              >
                <span class="material-symbols-outlined text-[20px]">edit_square</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-grow overflow-y-auto custom-scrollbar px-6 md:px-8 py-6" @scroll="handleFeedScroll">
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="i in 2" :key="i" class="bg-white/60 rounded-3xl p-5 border border-white/50 animate-pulse h-36"></div>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="post in posts" 
              :key="post.id" 
              class="bg-white/70 hover:bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[160px]"
              @click.stop="$emit('select-post', post)"
            >
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {{ post.nickname.charAt(0) }}
                    </div>
                    <div>
                      <div class="text-xs font-bold text-on-surface">{{ post.nickname }}</div>
                      <div class="text-[10px] text-on-surface-variant/60">리포트 · {{ post.category }}</div>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-on-surface-variant leading-relaxed">{{ post.content }}</p>
              </div>
              <div class="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
                <span class="text-xs text-on-surface/40 font-bold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px]">chat_bubble</span> 
                  댓글 {{ post.comments ? post.comments.length : 0 }}
                </span>
                <span class="material-symbols-outlined text-community-emerald opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
            <div v-if="posts.length === 0" class="text-center py-16 text-xs text-outline bg-white/40 border border-dashed border-border-subtle rounded-2xl col-span-full">
              작성된 실시간 소식이 없습니다. 첫 번째 이야기를 공유해 보세요.
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'detail' && selectedPost" key="detail" class="flex-grow flex flex-col overflow-hidden px-6 md:px-8 py-4">
        <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 flex-shrink-0">
          <div class="flex items-center gap-3">
            <button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors" @click.stop="backToFeed">
              <span class="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <span class="text-sm font-bold text-slate-800">소식 상세 조회</span>
          </div>
          <div class="flex gap-2">
            <button class="text-xs font-bold text-slate-500 hover:text-tourism-vibrant px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors" @click.stop="openAuthModal('edit')">수정</button>
            <button class="text-xs font-bold text-slate-500 hover:text-status-error px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors" @click.stop="openAuthModal('delete')">삭제</button>
          </div>
        </div>

        <div class="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1">
          <div class="border-b border-slate-100 pb-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {{ selectedPost.nickname.charAt(0) }}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-800">{{ selectedPost.nickname }}</div>
                  <div class="text-[11px] text-slate-400">실시간 리포팅</div>
                </div>
              </div>
            </div>
            <h2 class="text-lg font-bold text-slate-800 mb-3">{{ selectedPost.title }}</h2>
            <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{{ selectedPost.content }}</p>
          </div>

          <div>
            <h3 class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">댓글 {{ selectedPost.comments ? selectedPost.comments.length : 0 }}</h3>
            
            <form @submit.prevent="submitComment" class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3 mb-6">
              <div v-if="replyTarget" class="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] text-tourism-vibrant font-semibold">
                <span>{{ replyTarget.nickname }}님에게 답글 작성 중...</span>
                <button type="button" @click="clearReplyTarget" class="material-symbols-outlined text-[14px] text-slate-400 hover:text-slate-600">close</button>
              </div>

              <div class="flex gap-2">
                <input v-model="commentForm.nickname" type="text" placeholder="닉네임" class="w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-tourism-vibrant" required />
              </div>
              <textarea v-model="commentForm.content" :placeholder="replyTarget ? '답글 내용을 입력하세요' : '공유할 의견을 작성하세요'" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs min-h-[60px] focus:outline-none focus:border-tourism-vibrant resize-none" required></textarea>
              <div class="flex justify-end">
                <button type="submit" class="bg-tourism-vibrant text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">등록</button>
              </div>
            </form>

            <div class="flex flex-col gap-4 mb-6">
              <div v-for="comment in rootComments" :key="comment.id" class="flex flex-col gap-2">
                <div class="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex justify-between items-start">
                  <div class="flex-grow">
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-xs font-bold text-slate-800">{{ comment.nickname }}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">{{ comment.content }}</p>
                  </div>
                  <button 
                    class="text-[10px] font-bold text-tourism-vibrant hover:underline ml-3 flex-shrink-0"
                    @click.stop="setReplyTarget(comment)"
                  >
                    답글
                  </button>
                </div>

                <div 
                  v-for="reply in getRepliesFor(comment)" 
                  :key="reply.id" 
                  class="ml-8 pl-4 border-l-2 border-slate-200/80 bg-slate-50/40 rounded-r-xl p-3 flex flex-col"
                >
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-slate-700">{{ reply.nickname }}</span>
                    <span class="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">답글</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">{{ reply.content }}</p>
                </div>
              </div>

              <div v-if="rootComments.length === 0" class="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl">
                작성된 댓글이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'create'" key="create" class="flex-grow flex flex-col overflow-hidden px-6 md:px-8 py-4">
        <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3 flex-shrink-0">
          <button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors" @click.stop="cancelCreateOrEdit">
            <span class="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <span class="text-sm font-bold text-slate-800">{{ isEditingMode ? '이야기 수정' : '새 이야기 쓰기' }}</span>
        </div>

        <form @submit.prevent="submitPost" class="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">작성자 명의</label>
            <input v-model="createForm.nickname" type="text" placeholder="필명을 입력하세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" required />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">소식 제목</label>
            <input v-model="createForm.title" type="text" placeholder="한 줄 요약을 작성하세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" required />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">정보 상세 내용</label>
            <textarea v-model="createForm.content" placeholder="방문자들을 위한 현장 소식을 남겨주세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm min-h-[140px] focus:outline-none focus:border-tourism-vibrant transition-all resize-none" required></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">비밀번호 (수정/삭제용)</label>
            <input v-model="createForm.password" type="password" placeholder="비밀번호 4자리" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" required />
          </div>

          <button type="submit" class="w-full bg-community-emerald text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md mt-2">
            {{ isEditingMode ? '수정 완료하기' : '소식 발행하기' }}
          </button>
        </form>
      </div>
    </Transition>

    <div v-if="showAuthModal" class="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col gap-4">
        <h4 class="text-sm font-bold text-slate-800">본인 확인 인증</h4>
        <p class="text-xs text-slate-500 leading-relaxed">작성 시 입력한 비밀번호를 제공해 주십시오.</p>
        <input 
          v-model="authPassword" 
          type="password" 
          placeholder="비밀번호" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant"
          @keyup.enter="confirmAuth"
        />
        <div class="flex gap-2 justify-end mt-2">
          <button class="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg" @click="showAuthModal = false">취소</button>
          <button class="text-xs font-bold bg-status-error text-white px-4 py-2 rounded-lg" @click="confirmAuth">확인</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  selectedPlace: { type: Object, default: null },
  posts: { type: Array, default: () => [] },
  selectedPost: { type: Object, default: null },
  currentView: { type: String, default: 'feed' },
  isLoading: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  isFullyExpanded: { type: Boolean, default: false }
});

const emit = defineEmits([
  'select-post', 
  'toggle-expand', 
  'fully-expand', 
  'change-view',
  'submit-post',
  'update-post',
  'delete-post',
  'add-comment'
]);

const commentForm = ref({ nickname: '', content: '' });
const createForm = ref({ nickname: '', title: '', content: '', password: '' });

const transitionName = ref('slide-next');
const replyTarget = ref(null);

const isEditingMode = ref(false);
const showAuthModal = ref(false);
const authAction = ref(''); 
const authPassword = ref('');

const rootComments = computed(() => {
  if (!props.selectedPost || !props.selectedPost.comments) return [];
  return props.selectedPost.comments.filter(c => !c.parent_id);
});

const getRepliesFor = (comment) => {
  if (!comment) return [];
  
  if (Array.isArray(comment.replies)) return comment.replies;
  if (Array.isArray(comment.children)) return comment.children;
  
  if (!props.selectedPost || !props.selectedPost.comments) return [];
  
  return props.selectedPost.comments.filter(c => 
    c.parent_id && String(c.parent_id) === String(comment.id)
  );
};

const setReplyTarget = (comment) => {
  replyTarget.value = comment;
};

const clearReplyTarget = () => {
  replyTarget.value = null;
};

const openAuthModal = (action) => {
  authAction.value = action;
  authPassword.value = '';
  showAuthModal.value = true;
};

const confirmAuth = () => {
  showAuthModal.value = false;
  if (authAction.value === 'delete') {
    emit('delete-post', { postId: props.selectedPost.id, password: authPassword.value });
  } else if (authAction.value === 'edit') {
    isEditingMode.value = true;
    createForm.value = {
      nickname: props.selectedPost.nickname,
      title: props.selectedPost.title,
      content: props.selectedPost.content,
      password: ''
    };
    emit('change-view', 'create');
  }
};

const backToFeed = () => {
  clearReplyTarget();
  emit('change-view', 'feed');
};

const cancelCreateOrEdit = () => {
  if (isEditingMode.value) {
    isEditingMode.value = false;
    emit('change-view', 'detail');
  } else {
    emit('change-view', 'feed');
  }
};

watch(() => props.currentView, (newView) => {
  if (newView === 'feed') {
    transitionName.value = 'slide-prev';
  } else {
    transitionName.value = 'slide-next';
  }
});

const sheetClasses = computed(() => {
  let classes = [
    'fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-white/40 flex flex-col shadow-[0_-15px_50px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out'
  ];
  classes.push('md:left-1/2 md:-translate-x-1/2 md:max-w-3xl lg:max-w-4xl md:w-full');

  if (!props.selectedPlace) {
    classes.push('translate-y-full h-[78%] md:h-[72%]');
  } else if (props.isFullyExpanded) {
    classes.push('translate-y-0 h-full md:h-[95vh] rounded-t-none md:rounded-t-[2.5rem]');
  } else if (props.isExpanded) {
    classes.push('translate-y-0 h-[78%] md:h-[72%] rounded-t-[2.5rem]');
  } else {
    classes.push('translate-y-[calc(100%-88px)] md:translate-y-[calc(100%-110px)] h-[78%] md:h-[72%] rounded-t-[2.5rem]');
  }
  return classes;
});

const handleSheetClick = () => {
  if (props.selectedPlace && !props.isExpanded) {
    emit('toggle-expand');
  }
};

const handleWriteClick = () => {
  isEditingMode.value = false;
  createForm.value = { nickname: '', title: '', content: '', password: '' };
  if (!props.isExpanded) {
    emit('toggle-expand');
  }
  emit('change-view', 'create');
};

const handleFeedScroll = (e) => {
  const scrollTop = e.target.scrollTop;
  if (scrollTop > 15 && props.isExpanded && !props.isFullyExpanded) {
    emit('fully-expand', true);
  } else if (scrollTop === 0 && props.isFullyExpanded) {
    emit('fully-expand', false);
  }
};

const submitComment = () => {
  emit('add-comment', {
    postId: props.selectedPost.id,
    comment: {
      nickname: commentForm.value.nickname,
      content: commentForm.value.content,
      parent_id: replyTarget.value ? replyTarget.value.id : null
    }
  });
  commentForm.value.nickname = '';
  commentForm.value.content = '';
  clearReplyTarget();
};

const submitPost = () => {
  if (isEditingMode.value) {
    emit('update-post', {
      postId: props.selectedPost.id,
      postData: {
        title: createForm.value.title,
        content: createForm.value.content,
        nickname: createForm.value.nickname,
        password: createForm.value.password
      }
    });
    isEditingMode.value = false;
  } else {
    emit('submit-post', {
      title: createForm.value.title,
      content: createForm.value.content,
      nickname: createForm.value.nickname,
      password: createForm.value.password
    });
  }
  createForm.value = { nickname: '', title: '', content: '', password: '' };
};
</script>

<style scoped>
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(32px);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-32px);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(32px);
}
</style>