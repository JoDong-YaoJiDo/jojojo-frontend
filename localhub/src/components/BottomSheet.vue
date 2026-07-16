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
              
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                <div v-if="selectedPlace.content_type" class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-extrabold rounded-full tracking-wider shadow-sm select-none">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                    {{ selectedPlace.content_type }}
                  </span>
                </div>

                <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1.5 drop-shadow-sm select-none">
                  {{ selectedPlace.title }}
                </h1>

                <div class="flex items-center gap-1.5 text-xs text-white/90 drop-shadow-sm font-semibold">
                  <span class="material-symbols-outlined text-[16px] text-emerald-400">location_on</span>
                  <span>{{ selectedPlace.addr1 }}</span>
                </div>
              </div>
              
              <div class="absolute top-4 right-4 hidden md:flex flex-col items-end gap-2">
                <button 
                  class="bg-community-emerald text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2" 
                  @click.stop="handleWriteClick"
                >
                  <span class="material-symbols-outlined text-[18px]">edit_square</span>
                  <span>소식 남기기</span>
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
                      <div class="text-[10px] text-on-surface-variant/60">
                        리포트 · {{ post.category }} · {{ formatTime(post.created_at || post.createdAt) }}
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-on-surface-variant leading-relaxed">{{ post.content }}</p>
              </div>
              
              <div class="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs text-on-surface/40 font-bold flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">chat_bubble</span> 
                    댓글 {{ post.comments ? post.comments.length : 0 }}
                  </span>
                  <span class="text-xs text-on-surface/40 font-bold flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">visibility</span> 
                    조회수 {{ post.views || post.view_count || 0 }}
                  </span>
                </div>
                <span class="material-symbols-outlined text-community-emerald opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
            <div v-if="posts.length === 0" class="text-center py-16 text-xs text-outline bg-white/40 border border-dashed border-border-subtle rounded-2xl col-span-full">
              작성된 실시간 소식이 없습니다. 첫 번째 소식을 공유해 보세요.
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
                  <div class="text-[11px] text-slate-400">
                    {{ formatTime(selectedPost.created_at || selectedPost.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <h2 class="text-lg font-bold text-slate-800 mb-3">{{ selectedPost.title }}</h2>
            <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{{ selectedPost.content }}</p>

            <div v-if="selectedPost.images && selectedPost.images.length > 0" class="flex flex-col gap-3 my-4">
              <img 
                v-for="(img, idx) in selectedPost.images" 
                :key="idx" 
                :src="getImageUrl(img)" 
                class="w-full max-h-72 object-cover rounded-2xl border border-slate-100 shadow-sm" 
                alt="첨부 이미지"
              />
            </div>

            <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
              <div class="flex items-center gap-3 relative">
                <button 
                  type="button" 
                  class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer select-none"
                  @click.stop="triggerLikeClick"
                >
                  <span 
                    class="material-symbols-outlined text-[16px] text-red-500 block"
                    :class="{ 'animate-heart-bounce': isHeartAnimating }"
                  >
                    favorite
                  </span>
                  <span>좋아요 {{ selectedPost.likes || selectedPost.like_count || 0 }}</span>
                </button>
                
                <Transition name="tooltip-fade">
                  <div v-if="showLikeTooltip" class="absolute bottom-[135%] left-0 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md whitespace-nowrap z-50 pointer-events-none">
                    이미 좋아요를 표현한 소식입니다!
                  </div>
                </Transition>

                <span class="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>조회수 {{ selectedPost.views || selectedPost.view_count || 0 }}</span>
                </span>
              </div>
            </div>
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
              <textarea v-model="commentForm.content" :placeholder="replyTarget ? '답글 내용을 입력하세요' : '공유할 소식을 작성하세요'" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs min-h-[60px] focus:outline-none focus:border-tourism-vibrant resize-none" required></textarea>
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
                      <span class="text-[10px] text-slate-400">{{ formatTime(comment.created_at || comment.createdAt) }}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">{{ comment.content }}</p>
                  </div>
                  <button class="text-[10px] font-bold text-tourism-vibrant hover:underline ml-3 flex-shrink-0 align-top" @click.stop="setReplyTarget(comment)">답글</button>
                </div>

                <div v-for="reply in getRepliesFor(comment)" :key="reply.id" class="ml-8 pl-4 border-l-2 border-slate-200/80 bg-slate-50/40 rounded-r-xl p-3 flex flex-col">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-slate-700">{{ reply.nickname }}</span>
                    <span class="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">답글 · {{ formatTime(reply.created_at || reply.createdAt) }}</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">{{ reply.content }}</p>
                </div>
              </div>
              <div v-if="rootComments.length === 0" class="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl">작성된 댓글이 없습니다.</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'create'" key="create" class="flex-grow flex flex-col overflow-hidden px-6 md:px-8 py-4">
        <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3 flex-shrink-0">
          <button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors" @click.stop="cancelCreateOrEdit">
            <span class="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <span class="text-sm font-bold text-slate-800">{{ isEditingMode ? '소식 수정' : '새 소식 쓰기' }}</span>
        </div>

        <form @submit.prevent="submitPost" class="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">닉네임</label>
            <input v-model="createForm.nickname" type="text" placeholder="원하는 이름을 입력해 주세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" required />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">소식 제목</label>
            <input v-model="createForm.title" type="text" placeholder="한 줄 요약을 작성하세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" required />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">정보 상세 내용</label>
            <textarea v-model="createForm.content" placeholder="방문자들을 위한 현장 소식을 남겨주세요" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm min-h-[140px] focus:outline-none focus:border-tourism-vibrant transition-all resize-none" required></textarea>
          </div>

          <div v-if="!isEditingMode" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">이미지 첨부 (선택)</label>
            <div class="flex items-center gap-3">
              <label for="post-images-upload" class="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0">
                <span class="material-symbols-outlined text-[24px] text-slate-400">add_photo_alternate</span>
                <span class="text-[10px] text-slate-400 font-bold mt-1">사진 추가</span>
              </label>
              <input id="post-images-upload" type="file" multiple accept="image/*" class="hidden" @change="handleFileChange" />
              
              <div v-if="imagePreviews.length > 0" class="flex gap-2 overflow-x-auto py-1 no-scrollbar flex-grow">
                <div v-for="(preview, idx) in imagePreviews" :key="idx" class="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img :src="preview" class="w-full h-full object-cover" />
                  <button type="button" @click="removeImage(idx)" class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer border-none outline-none">
                    <span class="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isEditingMode" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500">비밀번호 (수정/삭제용)</label>
            <input v-model="createForm.password" type="password" placeholder="비밀번호 4자리" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tourism-vibrant transition-all" :required="!isEditingMode" />
          </div>

          <button type="submit" class="w-full bg-community-emerald text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md mt-2">
            {{ isEditingMode ? '소식 수정 완료하기' : '소식 등록하기' }}
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
import api from '../api'; 

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
  'add-comment',
  'like-post'
]);

const commentForm = ref({ nickname: '', content: '' });
const createForm = ref({ nickname: '', title: '', content: '', password: '' });

const selectedFiles = ref([]);
const imagePreviews = ref([]);

const isHeartAnimating = ref(false);
const showLikeTooltip = ref(false);
const likedHistory = ref(new Set()); 

const transitionName = ref('slide-next');
const replyTarget = ref(null);

const isEditingMode = ref(false);
const showAuthModal = ref(false);
const authAction = ref(''); 
const authPassword = ref('');

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  selectedFiles.value = [...selectedFiles.value, ...files];
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreviews.value.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const triggerLikeClick = () => {
  const postId = props.selectedPost.id;
  isHeartAnimating.value = true;
  setTimeout(() => { isHeartAnimating.value = false; }, 450);

  if (likedHistory.value.has(postId)) {
    showLikeTooltip.value = true;
    setTimeout(() => { showLikeTooltip.value = false; }, 2000);
    return;
  }

  likedHistory.value.add(postId);
  emit('like-post', postId);
};

// 백엔드 relative image_path 파싱 파이프라인
const getImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  
  const path = img.image_path || img.url || img.path;
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseUrl = api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'; 
  
  // 정규식을 활용하여 주소 끝단에 매칭되는 /api 혹은 /api/ 서브 경로 제거
  const rootUrl = baseUrl.replace(/\/api\/?$/, '');
  
  // 주소 연결 부 슬래시(/) 중복 및 유실 예외 처리
  const cleanBaseUrl = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${cleanBaseUrl}${cleanPath}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  let normalizedStr = timeStr;
  
  if (typeof timeStr === 'string' && timeStr.includes('T')) {
    const [, timePart] = timeStr.split('T');
    if (timePart && !timePart.endsWith('Z') && !timePart.includes('+') && !timePart.includes('-')) {
      normalizedStr = `${timeStr}Z`;
    }
  }

  const date = new Date(normalizedStr);
  if (isNaN(date.getTime())) return timeStr;
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

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

const setReplyTarget = (comment) => { replyTarget.value = comment; };
const clearReplyTarget = () => { replyTarget.value = null; };

const openAuthModal = (action) => {
  authAction.value = action;
  authPassword.value = '';
  showAuthModal.value = true;
};

const confirmAuth = async () => {
  if (authAction.value === 'delete') {
    showAuthModal.value = false;
    emit('delete-post', { postId: props.selectedPost.id, password: authPassword.value });
  } else if (authAction.value === 'edit') {
    try {
      await api.put(`/posts/${props.selectedPost.id}`, {
        title: props.selectedPost.title,
        content: props.selectedPost.content,
        nickname: props.selectedPost.nickname,
        password: authPassword.value
      });

      showAuthModal.value = false;
      isEditingMode.value = true;
      createForm.value = {
        nickname: props.selectedPost.nickname,
        title: props.selectedPost.title,
        content: props.selectedPost.content,
        password: authPassword.value 
      };
      emit('change-view', 'create');
    } catch (error) {
      console.error('수정 사전 본인 인증 실패:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        alert('인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  }
};

const backToFeed = () => {
  clearReplyTarget();
  emit('change-view', 'feed');
};

const cancelCreateOrEdit = () => {
  selectedFiles.value = [];
  imagePreviews.value = [];
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
  selectedFiles.value = [];
  imagePreviews.value = [];
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
      password: createForm.value.password,
      images: selectedFiles.value
    });
  }
  createForm.value = { nickname: '', title: '', content: '', password: '' };
  selectedFiles.value = [];
  imagePreviews.value = [];
};
</script>

<style scoped>
@keyframes heartBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.45) rotate(-8deg); }
  60% { transform: scale(0.88) rotate(4deg); }
  85% { transform: scale(1.1) rotate(-2deg); }
  100% { transform: scale(1); }
}

.animate-heart-bounce {
  animation: heartBounce 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

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