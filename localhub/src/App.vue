<template>
  <div class="bg-background-page text-on-surface h-screen flex flex-col overflow-hidden font-body-md tracking-tight">
    <header class="bg-white/80 backdrop-blur-md border-b border-border-subtle/50 w-full z-50 flex-shrink-0">
      <div class="flex items-center w-full px-6 md:px-8 h-16">
        <div class="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="LocalHub 로고"
            class="h-10 w-auto object-contain select-none"
          />
        </div>
      </div>
    </header>

    <main class="flex-grow flex flex-col overflow-hidden relative">
      <MapArea 
        :tourism-places="tourismPlaces" 
        :selected-place="selectedPlace"
        :current-region-coords="currentRegionCoords"
        @place-click="handlePlaceClick"
        @map-click="handleMapClick"
        @map-drag="handleMapDrag"
      />

      <div class="absolute top-6 left-6 right-6 md:right-auto md:w-[520px] z-[30] h-fit pointer-events-auto flex gap-2">
        
        <div class="relative flex-shrink-0 w-32">
          <button 
            @click.stop="isDropdownOpen = !isDropdownOpen"
            class="w-full h-full bg-white/95 backdrop-blur-md border border-border-subtle/50 text-xs font-bold rounded-2xl px-4 py-4 shadow-xl flex items-center justify-between gap-1 cursor-pointer transition-all hover:border-tourism-vibrant focus:outline-none focus:ring-4 focus:ring-tourism-vibrant/10 select-none text-on-surface-variant"
          >
            <span>{{ selectedRegionLabel }}</span>
            <span 
              class="material-symbols-outlined text-outline text-[18px] transition-transform duration-200"
              :class="{ 'rotate-180 text-tourism-vibrant': isDropdownOpen }"
            >
              keyboard_arrow_down
            </span>
          </button>

          <div 
            v-if="isDropdownOpen" 
            class="absolute top-[110%] left-0 w-full bg-white/95 backdrop-blur-md border border-border-subtle/50 rounded-2xl shadow-2xl py-2 z-50 flex flex-col gap-0.5 animate-dropdown-fade"
          >
            <button
              v-for="r in regions"
              :key="r.value"
              @click.stop="selectRegion(r.value)"
              :class="[
                CURRENT_REGION === r.value 
                  ? 'text-tourism-vibrant font-extrabold bg-tourism-vibrant/5' 
                  : 'text-on-surface-variant hover:bg-slate-50'
              ]"
              class="w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between"
            >
              <span>{{ r.label }}</span>
              <span v-if="CURRENT_REGION === r.value" class="material-symbols-outlined text-[14px] text-tourism-vibrant">check</span>
            </button>
          </div>
        </div>

        <div class="relative group flex-grow">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-tourism-vibrant transition-colors">search</span>
          <input 
            v-model="searchQuery" 
            class="w-full bg-white/95 backdrop-blur-md border border-border-subtle/50 text-base font-medium rounded-2xl pl-12 pr-4 py-4 shadow-xl focus:outline-none focus:border-tourism-vibrant focus:ring-4 focus:ring-tourism-vibrant/10 transition-all placeholder:text-outline/60" 
            placeholder="장소, 식당, 명소 검색..." 
            type="text"
            @input="handleSearch"
          />
        </div>
      </div>

      <div 
        class="absolute top-[88px] left-6 right-6 md:top-6 md:left-[556px] md:right-6 z-[30] h-fit overflow-x-auto no-scrollbar py-2.5 -my-1.5 pointer-events-auto touch-pan-x" 
        @wheel.prevent="handleWheel"
      >
        <div class="flex flex-nowrap gap-2 px-1 pr-4">
          <button 
            v-for="filter in filterOptions" 
            :key="filter.value"
            :class="[
              activeFilter === filter.value 
                ? 'bg-tourism-vibrant text-white shadow-lg shadow-tourism-vibrant/20 scale-105 border-tourism-vibrant' 
                : 'bg-white/90 backdrop-blur-md text-on-surface-variant border border-border-subtle/50 hover:bg-slate-50'
            ]"
            class="flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer select-none"
            @click="setFilter(filter.value)"
          >
            <span class="material-symbols-outlined text-[16px]">{{ getCategoryIcon(filter.value) }}</span>
            <span>{{ filter.label }}</span>
          </button>
        </div>
      </div>

      <BottomSheet 
        :selected-place="selectedPlace"
        :posts="posts"
        :selected-post="selectedPost"
        :current-view="sheetView"
        :is-loading="isLoading"
        :is-expanded="isSheetExpanded"
        :is-fully-expanded="isSheetFullyExpanded"
        @change-view="handleViewChange"
        @select-post="handleSelectPost"
        @toggle-expand="toggleSheet"
        @fully-expand="handleFullyExpand"
        @clear-place-filter="clearPlaceFilter"
        @submit-post="submitPost"
        @update-post="handlePostUpdate" @delete-post="handlePostDelete"
        @add-comment="handleCommentSubmit"
      />

      <ChatWidget :current-region-label="selectedRegionLabel" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MapArea from './components/MapArea.vue';
import BottomSheet from './components/BottomSheet.vue';
import ChatWidget from './chat/components/ChatWidget.vue';
import api from './api'; 

const regions = [
  { label: '전국', value: null, lat: 36.2684, lng: 127.8482, zoom: 8 },
  { label: '서울', value: '서울', lat: 37.5665, lng: 126.9780, zoom: 12 },
  { label: '부산', value: '부산', lat: 35.1796, lng: 129.0756, zoom: 12 },
  { label: '대전/충청', value: '대전_충청권', lat: 36.3504, lng: 127.3845, zoom: 11 },
  { label: '구미/경북', value: '구미_경북권', lat: 36.1194, lng: 128.3445, zoom: 11 },
  { label: '광주/전라', value: '광주_전라권', lat: 35.1595, lng: 126.8526, zoom: 11 }
];

const CURRENT_REGION = ref(null);
const isDropdownOpen = ref(false);

const selectedPost = ref(null);
const selectedPlace = ref(null);
const searchQuery = ref('');
const isLoading = ref(false);

const isSheetExpanded = ref(false);
const isSheetFullyExpanded = ref(false);

const activeFilter = ref('all');
const filterOptions = ref([{ label: '전체', value: 'all' }]);

const posts = ref([]);
const tourismPlaces = ref([]);
const sheetView = ref('feed');

const currentRegionCoords = computed(() => {
  const target = regions.find(r => r.value === CURRENT_REGION.value);
  return target ? { lat: target.lat, lng: target.lng, zoom: target.zoom } : { lat: 36.2684, lng: 127.8482, zoom: 8 };
});

const selectedRegionLabel = computed(() => {
  const target = regions.find(r => r.value === CURRENT_REGION.value);
  return target ? target.label : '전국';
});

const getCategoryIcon = (value) => {
  const iconMap = {
    'all': 'grid_view',
    12: 'tour',           
    14: 'museum',         
    15: 'festival',       
    25: 'route',          
    28: 'surfing',        
    32: 'hotel',          
    38: 'shopping_bag',   
    39: 'restaurant'      
  };
  return iconMap[value] || 'pin_drop';
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories', {
      params: { region: CURRENT_REGION.value }
    });
    const data = response.data;
    
    const categoriesSource = data.items ? data.items : data;
    let dynamicCategories = [];

    if (Array.isArray(categoriesSource)) {
      dynamicCategories = categoriesSource.map(item => ({
        label: item.content_type || item.name || item.label || item.title || String(item),
        value: item.content_type_id || item.id || item.value || item
      }));
    } else if (typeof categoriesSource === 'object' && categoriesSource !== null) {
      dynamicCategories = Object.entries(categoriesSource).map(([name, id]) => ({
        label: name,
        value: id
      }));
    }
    
    filterOptions.value = [{ label: '전체', value: 'all' }, ...dynamicCategories];
  } catch (error) {
    console.error('카테고리 API 조회 실패:', error);
  }
};

// [수정] 대용량 /places 대신 4개 필드만 전송받는 /all-places API 호출로 최적화
const fetchPlaces = async () => {
  try {
    isLoading.value = true;
    const params = { region: CURRENT_REGION.value };
    
    if (activeFilter.value !== 'all') {
      params.content_type_id = activeFilter.value;
    }
    if (searchQuery.value.trim()) {
      params.q = searchQuery.value.trim();
    }

    // 호출 엔드포인트 변경
    const response = await api.get('/all-places', { params });
    const data = response.data;

    // 초기 지도 렌더링에 필요한 핵심 좌표 정보만 경량 데이터셋으로 매핑
    tourismPlaces.value = data.map(place => ({
      id: place.id,
      title: place.title,
      mapx: place.mapx,
      mapy: place.mapy
    }));
  } catch (error) {
    console.error('장소 API 조회 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleRegionChange = async () => {
  activeFilter.value = 'all'; 
  selectedPlace.value = null; 
  selectedPost.value = null;
  sheetView.value = 'feed';
  
  await fetchCategories();
  await fetchPlaces();
};

const selectRegion = async (regionValue) => {
  CURRENT_REGION.value = regionValue;
  isDropdownOpen.value = false;
  await handleRegionChange();
};

const fetchPostsByPlace = async (placeId) => {
  try {
    isLoading.value = true;
    const response = await api.get(`/places/${placeId}/posts`, {
      params: { sort: 'latest', page: 1, size: 50 }
    });
    const data = response.data;

    const postsSource = data.items ? data.items : (Array.isArray(data) ? data : []);

    posts.value = postsSource.map(post => ({
      id: post.id,
      placeId: post.place_id,
      title: post.title,
      content: post.content,
      nickname: post.nickname,
      likes: post.like_count || 0,      // 백엔드 스펙 매핑 (like_count)
      bookmarks: post.bookmark_count || 0, // 백엔드 스펙 매핑 (bookmark_count)
      category: selectedPlace.value ? selectedPlace.value.title : '일반',
      created_at: post.created_at,      // 소식 생성 시간 파이프라인 연결
      comments: (post.comments || []).map(c => ({
        id: c.id,
        post_id: c.post_id,
        parent_id: c.parent_id,
        nickname: c.nickname,
        content: c.content,
        created_at: c.created_at,       // 댓글 생성 시간 파이프라인 연결
        replies: c.replies || []
      }))
    }));
  } catch (error) {
    console.error('게시글 API 조회 실패:', error);
    posts.value = [];
  } finally {
    isLoading.value = false;
  }
};

const submitPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append('place_id', selectedPlace.value ? selectedPlace.value.id : 101);
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('nickname', postData.nickname || '익명');
    formData.append('password', postData.password || '1234'); 

    await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    sheetView.value = 'feed';
    if (selectedPlace.value) {
      await fetchPostsByPlace(selectedPlace.value.id);
    }
  } catch (error) {
    console.error('게시글 생성 에러:', error);
  }
};

const handleCommentSubmit = async ({ postId, comment }) => {
  try {
    await api.post(`/posts/${postId}/comments`, {
      nickname: comment.nickname || '익명',
      content: comment.content,
      parent_id: comment.parent_id || null 
    });

    const response = await api.get(`/posts/${postId}`);
    const detailData = response.data;

    selectedPost.value = {
      id: detailData.id,
      placeId: detailData.place_id,
      title: detailData.title,
      content: detailData.content,
      nickname: detailData.nickname,
      likes: detailData.like_count || 0,
      bookmarks: detailData.bookmark_count || 0,
      category: selectedPlace.value ? selectedPlace.value.title : '일반',
      created_at: detailData.created_at, // 소식 생성 시간 동기화
      comments: (detailData.comments || []).map(c => ({
        id: c.id,
        post_id: c.post_id,
        parent_id: c.parent_id,
        nickname: c.nickname,
        content: c.content,
        created_at: c.created_at,       // 댓글 생성 시간 동기화
        replies: c.replies || []
      }))
    };

    if (selectedPlace.value) {
      await fetchPostsByPlace(selectedPlace.value.id);
    }
  } catch (error) {
    console.error('댓글 생성 에러:', error);
  }
};

const handlePostUpdate = async ({ postId, postData }) => {
  try {
    isLoading.value = true;

    // 모달을 통해 수집한 검증용 비밀번호를 API 페이로드에 적재
    await api.put(`/posts/${postId}`, {
      title: postData.title,
      content: postData.content,
      nickname: postData.nickname,
      password: postData.password 
    });

    // 수정 완료 후 상세 데이터 재조회 및 화면 전환
    await handleSelectPost({ id: postId });
    
    // 목록 갱신
    if (selectedPlace.value) {
      await fetchPostsByPlace(selectedPlace.value.id);
    }
  } catch (error) {
    console.error('소식 수정 오류:', error);
    
    // 비밀번호 오류 예외 분기
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('비밀번호가 일치하지 않습니다.');
    } else {
      alert('소식 수정 처리 중 장애가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  } finally {
    isLoading.value = false;
  }
};

const handlePostDelete = async ({ postId, password }) => {
  try {
    isLoading.value = true;
    await api.delete(`/posts/${postId}`, {
      params: { password }
    });

    sheetView.value = 'feed';
    selectedPost.value = null;
    if (selectedPlace.value) {
      await fetchPostsByPlace(selectedPlace.value.id);
    }
  } catch (error) {
    alert('비밀번호가 올바르지 않거나 삭제 권한이 없습니다.');
    console.error('게시글 삭제 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleLike = async (postId) => {
  try {
    await api.post(`/posts/${postId}/like`);
    const post = posts.value.find(p => p.id === postId);
    if (post) post.likes++;
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
  }
};

const handleBookmark = async (postId) => {
  try {
    await api.post(`/posts/${postId}/bookmark`);
    const post = posts.value.find(p => p.id === postId);
    if (post) post.bookmarks++;
  } catch (error) {
    console.error('북마크 토글 실패:', error);
  }
};

// [수정] 마커 클릭 시 즉시 UI 반응성을 확보하고, 상세 정보 및 피드를 비동기 병렬 요청하여 BottomSheet를 보완함
const handlePlaceClick = async (place) => {
  // 1. 최소 데이터 기반으로 상태 변경하여 레이아웃 즉각 출력
  selectedPlace.value = place;
  sheetView.value = 'feed';
  selectedPost.value = null;
  isSheetExpanded.value = true; 
  isSheetFullyExpanded.value = false;

  // 2. 관련 게시물 목록을 백그라운드 호출
  fetchPostsByPlace(place.id);

  // 3. BottomSheet의 세부 렌더링에 필요한 상세 스펙을 비동기로 패치 후 바인딩 결합
  try {
    const response = await api.get('/details', { params: { place_id: place.id } });
    const detail = response.data;
    
    // 기존 간이 객체(id, title, mapx, mapy)에 주소, 연락처, 이미지 등의 상세 프로퍼티 병합
    selectedPlace.value = {
      ...place,
      addr1: detail.addr1,
      tel: detail.tel,
      rating: detail.rating || 4.5,
      image: detail.firstimage || detail.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
      feedCount: detail.feedCount || 0
    };
  } catch (error) {
    console.error('클릭 장소 상세 로드 실패:', error);
  }
};

const setFilter = (filterValue) => {
  activeFilter.value = filterValue;
  fetchPlaces();
};

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchPlaces();
  }, 300);
};

const handleMapClick = () => {
  isDropdownOpen.value = false; 
  selectedPlace.value = null;
  selectedPost.value = null;
  sheetView.value = 'feed';
  isSheetExpanded.value = false;
  isSheetFullyExpanded.value = false;
};

const handleMapDrag = () => {
  isDropdownOpen.value = false;
  if (selectedPlace.value) {
    isSheetExpanded.value = false;
    isSheetFullyExpanded.value = false;
  }
};

const toggleSheet = () => {
  if (isSheetFullyExpanded.value) {
    isSheetFullyExpanded.value = false;
    isSheetExpanded.value = true;
  } else {
    isSheetExpanded.value = !isSheetExpanded.value;
  }
};

const handleFullyExpand = (status) => {
  isSheetFullyExpanded.value = status;
};

const clearPlaceFilter = () => {
  selectedPlace.value = null;
  selectedPost.value = null;
  sheetView.value = 'feed';
  isSheetExpanded.value = false; 
  isSheetFullyExpanded.value = false;
};

const handleViewChange = (view) => {
  sheetView.value = view;
  if (view === 'feed') {
    selectedPost.value = null;
  }
};

const handleSelectPost = async (post) => {
  try {
    isLoading.value = true;
    const response = await api.get(`/posts/${post.id}`);
    const detailData = response.data;

    selectedPost.value = {
      id: detailData.id,
      placeId: detailData.place_id,
      title: detailData.title,
      content: detailData.content,
      nickname: detailData.nickname,
      likes: detailData.like_count || 0,
      bookmarks: detailData.bookmark_count || 0,
      category: selectedPlace.value ? selectedPlace.value.title : '일반',
      created_at: detailData.created_at, // 소식 생성 시간 동기화
      comments: (detailData.comments || []).map(c => ({
        id: c.id,
        post_id: c.post_id,
        parent_id: c.parent_id,
        nickname: c.nickname,
        content: c.content,
        created_at: c.created_at,       // 댓글 생성 시간 동기화
        replies: c.replies || []
      }))
    };
    sheetView.value = 'detail';
  } catch (error) {
    console.error('게시글 상세 정보 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchPlaces();
});

const handleWheel = (e) => {
  const container = e.currentTarget;
  if (container) {
    container.scrollLeft += e.deltaY;
  }
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}

@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-dropdown-fade {
  animation: dropdown-fade 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>