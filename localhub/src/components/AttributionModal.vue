<template>
  <div 
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border-subtle/30 flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2 text-on-surface font-bold text-sm select-none">
          <span class="material-symbols-outlined text-tourism-vibrant text-[20px]">info</span>
          <span>공공데이터 출처 고지</span>
        </div>
        <button
          class="text-outline hover:text-on-surface flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-3.5 text-xs text-on-surface-variant leading-relaxed font-medium">
        <p class="text-sm text-on-surface font-semibold bg-slate-50 p-3.5 rounded-xl border border-border-subtle/20">
          이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.
        </p>
        
        <div class="flex flex-col gap-1">
          <span class="text-outline font-bold text-[11px] uppercase tracking-wider">원본 출처</span>
          <a 
            href="https://www.data.go.kr/data/15101578/openapi.do" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-tourism-vibrant hover:underline flex items-center gap-1 font-bold"
          >
            <span>한국관광공사 공공데이터포털 바로가기</span>
            <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>

        <div class="flex flex-col gap-1 border-t border-slate-100 pt-3">
          <span class="text-outline font-bold text-[11px] uppercase tracking-wider">적용 라이선스</span>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="px-2 py-0.5 bg-slate-100 text-outline text-[10px] font-bold rounded border border-slate-200">공공누리 제3유형</span>
            <span class="text-on-surface/70 font-semibold text-[11px]">출처표시 + 변경금지</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2 border-t border-slate-50">
        <button 
          class="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none"
          @click="emit('close')"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close']);
</script>