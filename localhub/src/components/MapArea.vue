<template>
  <div class="flex-grow relative h-[512px] md:h-auto z-0">
    <div ref="mapRef" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const props = defineProps({
  tourismPlaces: { type: Array, default: () => [] },
  selectedPlace: { type: Object, default: null },
  currentRegionCoords: { type: Object, default: () => ({ lat: 36.2684, lng: 127.8482, zoom: 8 }) }
});

const emit = defineEmits(['place-click', 'map-click', 'map-drag']);

const mapRef = ref(null);
let map = null;
let googleMarkers = [];
let markerClusterer = null; 

let globalInfoWindow = null; 
let activeInfoWindowMarker = null;

const markerDOMMap = new Map();
let isProgrammaticZoom = false;
const LATITUDE_OFFSET = 0.005; 

let animationFrameId = null;
const CHUNK_SIZE = 50; 

// [2단계 유지] 사전 오프셋 좌표 연산
const processedPlaces = computed(() => {
  const places = props.tourismPlaces;
  const positionCountMap = {};

  return places.map(place => {
    if (!place.mapy || !place.mapx) return null;

    let lat = Number(place.mapy);
    let lng = Number(place.mapx);
    const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

    if (positionCountMap[coordKey]) {
      const count = positionCountMap[coordKey];
      const angle = count * (Math.PI / 4); 
      const radius = 0.00012 * Math.ceil(count / 8); 
      lat += Math.sin(angle) * radius;
      lng += Math.cos(angle) * radius;
      positionCountMap[coordKey]++;
    } else {
      positionCountMap[coordKey] = 1;
    }

    return {
      ...place,
      adjustedLat: lat,
      adjustedLng: lng
    };
  }).filter(Boolean);
});

setOptions({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
});

const minimalMapStyle = [
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9effe" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f7fa" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
];

const initMap = async () => {
  try {
    const { Map } = await importLibrary('maps');
    const googleMaps = await importLibrary('maps');
    
    const defaultCenter = { lat: props.currentRegionCoords.lat, lng: props.currentRegionCoords.lng };
    const defaultZoom = props.currentRegionCoords.zoom;

    isProgrammaticZoom = true;
    map = new Map(mapRef.value, {
      center: defaultCenter,
      zoom: defaultZoom,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      mapId: 'DEMO_MAP_ID',
      clickableIcons: false,
      styles: minimalMapStyle
    });

    globalInfoWindow = new googleMaps.InfoWindow({
      disableAutoPan: true
    });

    setTimeout(() => {
      isProgrammaticZoom = false;
    }, 500);

    map.addListener('click', () => {
      if (globalInfoWindow) globalInfoWindow.close();
      activeInfoWindowMarker = null;
      emit('map-click');
    });

    map.addListener('dragstart', () => {
      emit('map-drag');
    });

    map.addListener('zoom_changed', () => {
      if (!isProgrammaticZoom) {
        emit('map-drag');
      }
    });

    await renderMarkers();
  } catch (error) {
    console.error('구글 지도 로드 실패:', error);
  }
};

const applyMarkerStyle = (placeId, isSelected) => {
  const cachedDOM = markerDOMMap.get(placeId);
  if (!cachedDOM) return;

  const { container, badge, arrow } = cachedDOM;

  if (isSelected) {
    container.className = 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-[1.18] z-10 gpu-accelerated-marker';
    badge.className = 'flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-lg shadow-emerald-500/30 whitespace-nowrap';
    arrow.className = 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600 -mt-[1px]';

    const existingRipple = container.querySelector('.animate-ripple-periodic');
    if (!existingRipple) {
      const periodicRipple = document.createElement('div');
      periodicRipple.className = 'animate-ripple-periodic';
      container.appendChild(periodicRipple);
    }
  } else {
    container.className = 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-100 z-0 gpu-accelerated-marker';
    badge.className = 'flex items-center gap-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-md shadow-blue-500/15 whitespace-nowrap';
    arrow.className = 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 -mt-[1px]';

    const existingRipple = container.querySelector('.animate-ripple-periodic');
    if (existingRipple) {
      existingRipple.remove();
    }
  }
};

const renderMarkers = async () => {
  if (!map) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (globalInfoWindow) {
    globalInfoWindow.close();
    activeInfoWindowMarker = null;
  }

  googleMarkers.forEach(marker => {
    marker.map = null;
  });
  googleMarkers = [];
  markerDOMMap.clear(); 

  if (markerClusterer) {
    markerClusterer.clearMarkers();
  }

  try {
    const { AdvancedMarkerElement } = await importLibrary('marker');
    const places = processedPlaces.value;
    const totalCount = places.length;
    
    let currentIndex = 0;

    const processChunk = () => {
      const end = Math.min(currentIndex + CHUNK_SIZE, totalCount);

      for (let i = currentIndex; i < end; i++) {
        const place = places[i];

        const position = { lat: place.adjustedLat, lng: place.adjustedLng };
        const isSelected = props.selectedPlace && props.selectedPlace.id === place.id;

        const container = document.createElement('div');
        container.className = isSelected 
          ? 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-[1.18] z-10 animate-marker-drop gpu-accelerated-marker' 
          : 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-100 z-0 animate-marker-drop gpu-accelerated-marker';
        container.style.animationDelay = `${Math.min(i * 4, 80)}ms`;

        // [최적화 3단계] 다중 createElement 연산을 단일 innerHTML 템플릿 마크업 주입으로 대체
        const iconName = place.content_type === '맛집/카페' ? 'restaurant' : 'account_balance';
        const badgeClass = isSelected
          ? 'flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-lg shadow-emerald-500/30 whitespace-nowrap'
          : 'flex items-center gap-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-md shadow-blue-500/15 whitespace-nowrap';
        const arrowClass = isSelected
          ? 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600 -mt-[1px]'
          : 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 -mt-[1px]';

        container.innerHTML = `
          ${isSelected ? '<div class="animate-ripple-periodic"></div>' : ''}
          <div class="${badgeClass}">
            <span class="material-symbols-outlined text-[14px]">${iconName}</span>
            <span>${place.title}</span>
          </div>
          <div class="${arrowClass}"></div>
        `;

        // 고성능 인덱스 트리거 기반 캐싱 (querySelector 완전 배제)
        const badge = isSelected ? container.children[1] : container.children[0];
        const arrow = isSelected ? container.children[2] : container.children[1];

        markerDOMMap.set(place.id, { container, badge, arrow });

        const marker = new AdvancedMarkerElement({
          position: position,
          title: place.title,
          content: container,
        });

        const infoContent = `
          <div style="padding: 10px; font-family: system-ui, -apple-system, sans-serif; min-width: 170px;">
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0F172A;">${place.title}</h4>
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; line-height: 1.4;">${place.addr1}</p>
            ${place.tel ? `<p style="margin: 0; font-size: 11px; color: #3B82F6; font-weight: 600;">☎ ${place.tel}</p>` : ''}
          </div>
        `;

        container.addEventListener('mouseenter', () => {
          if (activeInfoWindowMarker !== marker) {
            globalInfoWindow.setContent(infoContent);
            globalInfoWindow.open(map, marker);
            activeInfoWindowMarker = marker;
          }
          container.style.transform = isSelected ? 'scale(1.28)' : 'scale(1.15)';
        });

        container.addEventListener('mouseleave', () => {
          container.style.transform = isSelected ? 'scale(1.18)' : 'scale(1.0)';
        });

        container.addEventListener('click', (e) => {
          e.stopPropagation();
          emit('place-click', place);
          
          const ripple = document.createElement('div');
          ripple.className = 'animate-ripple';
          container.appendChild(ripple);
          setTimeout(() => { ripple.remove(); }, 500);

          if (map) {
            const targetLatLng = { lat: Number(place.adjustedLat) - LATITUDE_OFFSET, lng: Number(place.adjustedLng) };
            isProgrammaticZoom = true;
            map.panTo(targetLatLng);
            map.setZoom(16);
            setTimeout(() => { isProgrammaticZoom = false; }, 800);
          }
        });

        googleMarkers.push(marker);
      }

      currentIndex = end;

      if (currentIndex < totalCount) {
        animationFrameId = requestAnimationFrame(processChunk);
      } else {
        buildClusterer();
      }
    };

    processChunk();

  } catch (error) {
    console.error('마커 생성 및 클러스터러 연동 실패:', error);
  }
};

const buildClusterer = () => {
  const customRenderer = {
    render({ count, position }) {
      const clusterContainer = document.createElement('div');
      clusterContainer.className = 'relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500/35 backdrop-blur-sm shadow-md transition-transform duration-200 hover:scale-110 cursor-pointer gpu-accelerated-marker';

      const innerCore = document.createElement('div');
      innerCore.className = 'w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-blue-700/25';
      innerCore.innerText = String(count);

      clusterContainer.appendChild(innerCore);

      return new google.maps.marker.AdvancedMarkerElement({
        position,
        content: clusterContainer,
      });
    }
  };

  markerClusterer = new MarkerClusterer({
    map: map,
    markers: googleMarkers,
    renderer: customRenderer 
  });
};

watch(() => props.selectedPlace, (newPlace, oldPlace) => {
  if (oldPlace) {
    applyMarkerStyle(oldPlace.id, false);
  }
  if (newPlace) {
    applyMarkerStyle(newPlace.id, true);

    if (map && newPlace.mapy && newPlace.mapx) {
      const targetLatLng = { lat: Number(newPlace.mapy) - LATITUDE_OFFSET, lng: Number(newPlace.mapx) };
      isProgrammaticZoom = true;
      map.panTo(targetLatLng);
      map.setZoom(16);
      setTimeout(() => {
        isProgrammaticZoom = false;
      }, 800);
    }
  }
});

watch(() => props.currentRegionCoords, (coords) => {
  if (coords && map && !props.selectedPlace) {
    isProgrammaticZoom = true;
    map.panTo({ lat: coords.lat, lng: coords.lng });
    map.setZoom(coords.zoom);
    setTimeout(() => {
      isProgrammaticZoom = false;
    }, 800);
  }
}, { deep: true });

watch(() => props.tourismPlaces, async () => {
  if (map) {
    await renderMarkers();
  }
}, { deep: true });

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style>
.gpu-accelerated-marker {
  will-change: transform, opacity;
  contain: layout paint;
}

@keyframes marker-drop-bounce {
  0 {
    transform: translateY(-40px) scaleY(1.15);
    opacity: 0;
  }
  60% {
    transform: translateY(3px) scaleY(0.9);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scaleY(1);
  }
}

.animate-marker-drop {
  animation: marker-drop-bounce 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3.5);
    opacity: 0;
  }
}

.animate-ripple {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #10B981;
  background: rgba(16, 185, 129, 0.15);
  pointer-events: none;
  z-index: -1;
  animation: ripple-expand 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}

@keyframes ripple-periodic-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(3.8);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(3.8);
    opacity: 0;
  }
}

.animate-ripple-periodic {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #10B981;
  background: rgba(16, 185, 129, 0.12);
  pointer-events: none;
  z-index: -1;
  animation: ripple-periodic-expand 3.2s infinite cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>