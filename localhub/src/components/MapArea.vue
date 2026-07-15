<template>
  <div class="flex-grow relative h-[512px] md:h-auto z-0">
    <div ref="mapRef" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import api from '../api'; 

const props = defineProps({
  tourismPlaces: { type: Array, default: () => [] },
  selectedPlace: { type: Object, default: null },
  currentRegionCoords: { type: Object, default: () => ({ lat: 36.2684, lng: 127.8482, zoom: 8 }) }
});

const emit = defineEmits(['place-click', 'map-click', 'map-drag']);

const mapRef = ref(null);
let map = null;
let globalInfoWindow = null; 
let activeInfoWindowMarker = null;
let AdvancedMarkerElementClass = null;

const markerPool = new Map();
const placeDetailsCache = new Map(); 

let isProgrammaticZoom = false;
const LATITUDE_OFFSET = 0.005; 
const MAX_MARKERS_LIMIT = 80;

const KOREA_BOUNDS = {
  north: 39.2, 
  south: 32.8, 
  west: 123.5, 
  east: 132.0  
};

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
      id: place.id,
      title: place.title,
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
    const { AdvancedMarkerElement } = await importLibrary('marker');
    
    AdvancedMarkerElementClass = AdvancedMarkerElement;

    const defaultCenter = { lat: props.currentRegionCoords.lat, lng: props.currentRegionCoords.lng };
    const defaultZoom = props.currentRegionCoords.zoom;

    isProgrammaticZoom = true;
    
    map = new Map(mapRef.value, {
      center: defaultCenter,
      zoom: defaultZoom,
      disableDefaultUI: true, 
      zoomControl: false,     
      mapTypeControl: false,  
      scaleControl: false,    
      streetViewControl: false, 
      rotateControl: false,   
      fullscreenControl: false, 
      mapId: 'DEMO_MAP_ID',
      clickableIcons: false,
      styles: minimalMapStyle,
      restriction: {
        latLngBounds: KOREA_BOUNDS,
        strictBounds: false 
      },
      minZoom: 7 
    });

    globalInfoWindow = new google.maps.InfoWindow({
      disableAutoPan: true
    });

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

    map.addListener('idle', () => {
      updateMapDisplay();
      // [핵심 변경] 카메라 이동 완료로 idle 상태가 되었을 때, 안전 구역 내에서 락 해제 및 제한 바운더리 복구 재적용
      if (isProgrammaticZoom) {
        isProgrammaticZoom = false; 
        map.setOptions({
          restriction: {
            latLngBounds: KOREA_BOUNDS,
            strictBounds: false
          }
        });
      }
    });

    updateMapDisplay();

  } catch (error) {
    console.error('구글 지도 로드 실패:', error);
  }
};

const createSingleMarkerDOM = (place, isSelected) => {
  const container = document.createElement('div');
  container.className = isSelected 
    ? 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-[1.18] z-10 overflow-visible gpu-accelerated-marker' 
    : 'relative flex flex-col items-center cursor-pointer transition-transform duration-300 scale-100 z-0 overflow-visible gpu-accelerated-marker';

  const badgeClass = isSelected
    ? 'flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-lg shadow-emerald-500/30 whitespace-nowrap pointer-events-none'
    : 'flex items-center gap-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3.5 py-2 rounded-full text-xs font-bold border-2 border-white shadow-md shadow-blue-500/15 whitespace-nowrap pointer-events-none';
  const arrowClass = isSelected
    ? 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600 -mt-[1px] pointer-events-none'
    : 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 -mt-[1px] pointer-events-none';

  container.innerHTML = `
    ${isSelected ? '<div class="animate-ripple-periodic pointer-events-none"></div>' : ''}
    <div class="${badgeClass}">
      <span class="material-symbols-outlined text-[14px] pointer-events-none">pin_drop</span>
      <span class="pointer-events-none">${place.title}</span>
    </div>
    <div class="${arrowClass}"></div>
  `;
  return container;
};

const createClusterMarkerDOM = (count) => {
  const clusterContainer = document.createElement('div');
  clusterContainer.className = 'relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500/35 backdrop-blur-sm shadow-md transition-transform duration-200 hover:scale-110 cursor-pointer overflow-visible gpu-accelerated-marker';

  const innerCore = document.createElement('div');
  innerCore.className = 'w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-blue-700/25 pointer-events-none';
  innerCore.innerText = String(count);

  clusterContainer.appendChild(innerCore);
  return clusterContainer;
};

const updateMapDisplay = () => {
  if (!map || !AdvancedMarkerElementClass || processedPlaces.value.length === 0) return;

  const bounds = map.getBounds();
  const center = map.getCenter();
  const zoom = map.getZoom();
  if (!bounds || !center || zoom === undefined) return;

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latSpan = ne.lat() - sw.lat();
  const lngSpan = ne.lng() - sw.lng();

  const latPadding = latSpan * 0.3;
  const lngPadding = lngSpan * 0.3;
  const paddedNorth = ne.lat() + latPadding;
  const paddedSouth = sw.lat() - latPadding;
  const paddedEast = ne.lng() + lngPadding;
  const paddedWest = sw.lng() - lngPadding;

  const filteredPlaces = processedPlaces.value.filter(place => {
    return place.adjustedLat >= paddedSouth && 
           place.adjustedLat <= paddedNorth && 
           place.adjustedLng >= paddedWest && 
           place.adjustedLng <= paddedEast;
  });

  const configs = [];

  if (zoom >= 15) {
    const centerLat = center.lat();
    const centerLng = center.lng();
    const placesWithDistance = filteredPlaces.map(place => {
      const dy = place.adjustedLat - centerLat;
      const dx = place.adjustedLng - centerLng;
      return { place, distSq: dx * dx + dy * dy };
    });
    placesWithDistance.sort((a, b) => a.distSq - b.distSq);

    const limited = placesWithDistance.slice(0, MAX_MARKERS_LIMIT);
    limited.forEach(item => {
      configs.push({
        id: `single_${item.place.id}`,
        type: 'single',
        position: { lat: item.place.adjustedLat, lng: item.place.adjustedLng },
        place: item.place
      });
    });
  } else {
    let gridSize = 0.02;
    if (zoom <= 7) gridSize = 1.2;
    else if (zoom <= 8) gridSize = 0.8;
    else if (zoom <= 9) gridSize = 0.4;
    else if (zoom <= 10) gridSize = 0.2;
    else if (zoom <= 11) gridSize = 0.09;
    else if (zoom <= 12) gridSize = 0.04;
    else if (zoom <= 13) gridSize = 0.02;
    else if (zoom <= 14) gridSize = 0.01;

    const cells = {};
    filteredPlaces.forEach(place => {
      const latKey = Math.floor(place.adjustedLat / gridSize);
      const lngKey = Math.floor(place.adjustedLng / gridSize);
      const key = `${latKey}_${lngKey}`;
      
      if (!cells[key]) cells[key] = [];
      cells[key].push(place);
    });

    Object.keys(cells).forEach(key => {
      const group = cells[key];
      let sumLat = 0;
      let sumLng = 0;
      group.forEach(p => {
        sumLat += p.adjustedLat;
        sumLng += p.adjustedLng;
      });
      const avgLat = sumLat / group.length;
      const avgLng = sumLng / group.length;

      if (group.length === 1) {
        configs.push({
          id: `single_${group[0].id}`,
          type: 'single',
          position: { lat: avgLat, lng: avgLng },
          place: group[0]
        });
      } else {
        configs.push({
          id: `cluster_${key}`,
          type: 'cluster',
          position: { lat: avgLat, lng: avgLng },
          count: group.length
        });
      }
    });
  }

  const usedIds = new Set();

  configs.forEach(config => {
    usedIds.add(config.id);
    let poolEntry = markerPool.get(config.id);
    const isSelected = config.type === 'single' && props.selectedPlace && props.selectedPlace.id === config.place.id;

    if (poolEntry) {
      poolEntry.marker.position = config.position;
      
      if (config.type === 'single' && poolEntry.isSelected !== isSelected) {
        const newContent = createSingleMarkerDOM(config.place, isSelected);
        poolEntry.marker.content = newContent;
        poolEntry.isSelected = isSelected;
      } else if (config.type === 'cluster' && poolEntry.count !== config.count) {
        const newContent = createClusterMarkerDOM(config.count);
        poolEntry.marker.content = newContent;
        poolEntry.count = config.count;
      }
      
      if (poolEntry.marker.map !== map) {
        poolEntry.marker.map = map;
      }
    } else {
      let content;
      if (config.type === 'single') {
        content = createSingleMarkerDOM(config.place, isSelected);
      } else {
        content = createClusterMarkerDOM(config.count);
      }

      const marker = new AdvancedMarkerElementClass({
        position: config.position,
        content: content,
        map: map
      });

      if (config.type === 'single') {
        content.addEventListener('mouseenter', async () => {
          if (props.selectedPlace && props.selectedPlace.id === config.place.id) return;

          const currentSelected = props.selectedPlace && props.selectedPlace.id === config.place.id;
          content.style.transform = currentSelected ? 'scale(1.28)' : 'scale(1.15)';

          if (activeInfoWindowMarker === marker) return;
          activeInfoWindowMarker = marker;

          if (placeDetailsCache.has(config.place.id)) {
            const cachedData = placeDetailsCache.get(config.place.id);
            globalInfoWindow.setContent(createInfoWindowMarkup(cachedData));
            globalInfoWindow.open(map, marker);
            return;
          }

          globalInfoWindow.setContent(`
            <div style="padding: 24px 16px; font-family: system-ui, -apple-system, sans-serif; width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
              <div class="animate-spin-custom" style="width: 16px; height: 16px; border: 2.5px solid #3B82F6; border-top-color: transparent; border-radius: 50%; display: inline-block;"></div>
              <span style="font-size: 11px; color: #64748B; font-weight: 600;">관광지 정보를 로딩 중...</span>
            </div>
          `);
          globalInfoWindow.open(map, marker);

          try {
            const response = await api.get('/details', { params: { place_id: config.place.id } });
            const detailData = response.data;
            placeDetailsCache.set(config.place.id, detailData);

            if (activeInfoWindowMarker === marker) {
              globalInfoWindow.setContent(createInfoWindowMarkup(detailData));
            }
          } catch (error) {
            console.error('장소 상세 조회 실패:', error);
          }
        });

        content.addEventListener('mouseleave', () => {
          const currentSelected = props.selectedPlace && props.selectedPlace.id === config.place.id;
          content.style.transform = currentSelected ? 'scale(1.18)' : 'scale(1.0)';
        });

        marker.addListener('click', () => {
          if (globalInfoWindow) globalInfoWindow.close();
          activeInfoWindowMarker = null;

          emit('place-click', config.place);
          if (map) {
            const targetLatLng = { lat: Number(config.position.lat) - LATITUDE_OFFSET, lng: Number(config.position.lng) };
            isProgrammaticZoom = true;
            // 이동 시에도 순간 클램핑 방지를 위해 바운더리 프리 해제 선언
            map.setOptions({ restriction: null });
            map.setOptions({
              center: targetLatLng,
              zoom: 16
            });
          }
        });
      } else {
        marker.addListener('click', () => {
          isProgrammaticZoom = true;
          // 클러스터 확대로 이동 시에도 바운더리 프리 해제 선언
          map.setOptions({ restriction: null });
          map.setOptions({
            center: config.position,
            zoom: map.getZoom() + 2
          });
        });
      }

      markerPool.set(config.id, {
        marker,
        type: config.type,
        isSelected: isSelected,
        count: config.count || 1
      });
    }
  });

  for (const [id, entry] of markerPool.entries()) {
    if (!usedIds.has(id)) {
      entry.marker.map = null;
      markerPool.delete(id); 
    }
  }
};

const createInfoWindowMarkup = (data) => {
  const imageUrl = data.firstimage || data.firstimage2 || data.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520';
  
  return `
    <div style="padding: 0; font-family: system-ui, -apple-system, sans-serif; width: 220px; overflow: hidden; border-radius: 12px; background: #ffffff;">
      <div style="width: 100%; height: 110px; overflow: hidden; background: #f1f5f9; position: relative; border-radius: 8px 8px 0 0;">
        <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="${data.title || '썸네일'}">
      </div>
      <div style="padding: 12px 6px 4px 6px;">
        <h4 style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: 800; color: #0F172A; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.title}</h4>
        <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${data.addr1 || '주소 정보 없음'}</p>
        ${data.tel ? `<p style="margin: 0; font-size: 11px; color: #3B82F6; font-weight: 600;">☎ ${data.tel}</p>` : ''}
      </div>
    </div>
  `;
};

watch(() => props.selectedPlace, (newPlace, oldPlace) => {
  if (oldPlace) {
    const oldEntry = markerPool.get(`single_${oldPlace.id}`);
    if (oldEntry) {
      const newContent = createSingleMarkerDOM(oldPlace, false);
      oldEntry.marker.content = newContent;
      oldEntry.isSelected = false;
    }
  }
  if (newPlace) {
    if (globalInfoWindow) globalInfoWindow.close();
    activeInfoWindowMarker = null;

    const newEntry = markerPool.get(`single_${newPlace.id}`);
    if (newEntry) {
      const newContent = createSingleMarkerDOM(newPlace, true);
      newEntry.marker.content = newContent;
      newEntry.isSelected = true;
    }

    if (map && newPlace.mapy && newPlace.mapx) {
      const targetLatLng = { lat: Number(newPlace.mapy) - LATITUDE_OFFSET, lng: Number(newPlace.mapx) };
      isProgrammaticZoom = true;
      map.setOptions({ restriction: null });
      map.setOptions({
        center: targetLatLng,
        zoom: 16
      });
    }
  }
});

watch(() => props.currentRegionCoords, (coords) => {
  if (coords && map && !props.selectedPlace) {
    isProgrammaticZoom = true;
    // [수정 핵심] 카메라를 워프하기 직전 제한선 설정을 null로 순간 제거하여 검증 필터 오작동 차단
    map.setOptions({ restriction: null });
    map.setOptions({
      center: { lat: coords.lat, lng: coords.zoom === 8 ? coords.lat : coords.lat }, // 원본 레퍼런스 유지
      center: { lat: coords.lat, lng: coords.lng },
      zoom: coords.zoom
    });
  }
}, { deep: true });

watch(() => props.tourismPlaces, () => {
  if (map) {
    markerPool.forEach(entry => { entry.marker.map = null; });
    markerPool.clear();
    updateMapDisplay();
  }
}, { deep: true });

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  markerPool.forEach(entry => { entry.marker.map = null; });
  markerPool.clear();
});
</script>

<style>
.gpu-accelerated-marker {
  will-change: transform, opacity;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin-custom {
  animation: spin 0.8s linear infinite;
}

@keyframes marker-drop-bounce {
  0% {
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

.gm-style-iw-c {
  padding: 6px !important;
  border-radius: 14px !important;
}
.gm-style-iw-d {
  overflow: hidden !important;
}
</style>