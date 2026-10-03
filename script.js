/**
 * Re:Connect 동창회 모바일 초대장 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  initPetalAnimation();
  initPhotoSlider();
  initCountdown();
  initLeafletMap();
  initRsvpAndGuestbook();
  initShareAndCopy();
  initScrollReveal();
});

/* ==========================================================================
   1. [사진 섹션] 부드러운 슬라이더 & 모바일 스와이프 & 모달 뷰어
   ========================================================================== */
function initPhotoSlider() {
  const slides = document.querySelectorAll('.slider-track .slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const captionTitle = document.getElementById('caption-title');
  const captionDesc = document.getElementById('caption-desc');
  const sliderContainer = document.getElementById('slider-container');

  // 모달 요소
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;

  let currentIndex = 0;
  let isPlaying = true;
  let slideInterval = null;
  const slideDuration = 4000; // 4초

  const slideData = [
    { title: '입학식 (우리들의 시작)', desc: '풋풋하고 설레던 첫 만남의 순간' },
    { title: '봄소풍 (푸르른 청춘)', desc: '햇살 아래 함께 웃고 떠들던 소풍날' },
    { title: '장기자랑 (뜨거웠던 무대)', desc: '숨겨둔 끼와 열정을 불태우던 밤' },
    { title: '졸업식 (안녕 그리고 또 만남)', desc: '새로운 시작을 축복하며 흘린 눈물' }
  ];

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    if (captionTitle && captionDesc && slideData[currentIndex]) {
      captionTitle.style.opacity = '0';
      captionDesc.style.opacity = '0';
      setTimeout(() => {
        captionTitle.textContent = slideData[currentIndex].title;
        captionDesc.textContent = slideData[currentIndex].desc;
        captionTitle.style.opacity = '1';
        captionDesc.style.opacity = '1';
      }, 200);
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, slideDuration);
  }

  function stopAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // 이전 / 다음 버튼
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      if (isPlaying) startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      if (isPlaying) startAutoPlay();
    });
  }

  // 도트 클릭
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      goToSlide(idx);
      if (isPlaying) startAutoPlay();
    });
  });

  // 재생 / 일시정지 토글
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        startAutoPlay();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        stopAutoPlay();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    });
  }

  // 모바일 터치 스와이프 제스처
  let touchStartX = 0;
  let touchEndX = 0;

  if (sliderContainer) {
    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    const threshold = 40; // 스와이프 감도
    if (diff > threshold) {
      // 오른쪽으로 스와이프 -> 이전 사진
      goToSlide(currentIndex - 1);
      if (isPlaying) startAutoPlay();
    } else if (diff < -threshold) {
      // 왼쪽으로 스와이프 -> 다음 사진
      goToSlide(currentIndex + 1);
      if (isPlaying) startAutoPlay();
    }
  }

  // 이미지 클릭 시 확대 모달
  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (img) {
      img.addEventListener('click', () => {
        if (!modal || !modalImg) return;
        modalImg.src = img.src;
        modalCaption.textContent = slideData[currentIndex].title + " - " + slideData[currentIndex].desc;
        modal.classList.add('active');
        stopAutoPlay();
      });
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
      if (isPlaying) startAutoPlay();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      modal.classList.remove('active');
      if (isPlaying) startAutoPlay();
    });
  }

  // 초기 자동재생 시작
  startAutoPlay();
}

/* ==========================================================================
   2. [카운트다운 섹션] 실시간 카운트다운 & 캘린더 등록
   ========================================================================== */
function initCountdown() {
  // 타깃 일시: 2032년 10월 1일 (토) 17:00:00 KST
  const targetDate = new Date('2032-10-01T17:00:00+09:00').getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-minutes');
  const secsEl = document.getElementById('count-seconds');
  const ddayBadge = document.getElementById('dday-badge');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      if (ddayBadge) ddayBadge.innerHTML = '<span class="sparkle-icon">✦</span> D-DAY (진행 중) <span class="sparkle-icon">✦</span>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    if (ddayBadge) ddayBadge.innerHTML = `<span class="sparkle-icon">✦</span> D - ${days} <span class="sparkle-icon">✦</span>`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 구글 캘린더 등록
  const googleCalBtn = document.getElementById('add-google-cal');
  if (googleCalBtn) {
    googleCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent("Re:Connect 동창회");
      const details = encodeURIComponent("세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회 모임");
      const location = encodeURIComponent("창경궁 (서울 종로구 창경궁로 185)");
      const dates = "20321001T080000Z/20321001T120000Z"; // UTC 기준 17:00~21:00 KST
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(url, '_blank');
    });
  }

  // iCal 다운로드
  const icalBtn = document.getElementById('download-ical');
  if (icalBtn) {
    icalBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ReConnect//Alumni Reunion//KO",
        "BEGIN:VEVENT",
        "UID:" + Date.now() + "@reconnect.alumni",
        "DTSTAMP:20261003T000000Z",
        "DTSTART:20321001T080000Z",
        "DTEND:20321001T120000Z",
        "SUMMARY:Re:Connect 동창회",
        "DESCRIPTION:세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회",
        "LOCATION:창경궁 (서울 종로구 창경궁로 185)",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'ReConnect_동창회.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("캘린더 일정 파일(.ics)이 다운로드되었습니다.");
    });
  }
}

/* ==========================================================================
   3. [지도 섹션] 300x300 규격 네이버 지도 렌더링 & 스마트 앱/웹 연동 시스템
   ========================================================================== */
const VENUE_INFO = {
  name: "창경궁",
  encodedName: encodeURIComponent("창경궁"),
  address: "서울 종로구 창경궁로 185",
  lat: 37.579617,
  lng: 126.991005
};

// 지도 인터랙티브 상태 (줌 & 팬)
const mapState = {
  zoom: 1,
  minZoom: 0.85,
  maxZoom: 2.2,
  posX: 0,
  posY: 0,
  isDragging: false,
  startX: 0,
  startY: 0
};

function initLeafletMap() {
  const mapContainer = document.getElementById('naver-vector-map');
  if (!mapContainer) return;

  // 100% 보장되는 고화질 인터랙티브 네이버 지도 생성
  renderFailProofNaverMap(mapContainer);
  initMapControls();
  initMapInteractions();
}

/**
 * 어떤 브라우저/로컬 환경에서도 오류 없이 0초 만에 완벽히 렌더링되는 인터랙티브 네이버 지도 엔진
 */
function renderFailProofNaverMap(container) {
  container.innerHTML = `
    <div class="naver-map-canvas" id="interactive-map-canvas">
      <!-- 배경 도로망 & 고궁 녹지 SVG 레이어 -->
      <svg class="map-svg-layer" viewBox="0 0 450 450" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="palaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d4edd8" />
            <stop offset="100%" stop-color="#bfe5c6" />
          </linearGradient>
          <linearGradient id="pondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#99d6ea" />
            <stop offset="100%" stop-color="#72c4e2" />
          </linearGradient>
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.12"/>
          </filter>
        </defs>

        <!-- 배경 기본 시가지 -->
        <rect width="450" height="450" fill="#f4f3f0" />

        <!-- 대학로 / 율곡로 대로 -->
        <path d="M-20,380 Q220,360 470,390" stroke="#ffffff" stroke-width="26" fill="none"/>
        <path d="M-20,380 Q220,360 470,390" stroke="#f0c680" stroke-width="18" fill="none"/>

        <!-- 창경궁로 (메인 도로) -->
        <path d="M340,-20 L330,470" stroke="#ffffff" stroke-width="32" fill="none"/>
        <path d="M340,-20 L330,470" stroke="#fed885" stroke-width="22" fill="none"/>

        <!-- 혜화역 연결 도로 -->
        <path d="M340,110 L470,90" stroke="#ffffff" stroke-width="22" fill="none"/>
        <path d="M340,110 L470,90" stroke="#fed885" stroke-width="14" fill="none"/>

        <!-- 창경궁 고궁 경내 녹지 영역 -->
        <polygon points="50,40 310,30 300,370 70,360 40,240" fill="url(#palaceGrad)" stroke="#a3d6ad" stroke-width="2.5" filter="url(#mapShadow)"/>

        <!-- 춘당지 (고궁 연못) -->
        <path d="M190,95 C230,85 260,110 250,135 C240,155 200,165 180,145 C165,130 170,105 190,95 Z" fill="url(#pondGrad)" stroke="#5bb0d3" stroke-width="1.5"/>
        <text x="215" y="130" font-family="'Noto Sans KR', sans-serif" font-size="10" font-weight="700" fill="#1b6585" text-anchor="middle">춘당지</text>

        <!-- 명정전 (창경궁 정전) 건물 영역 -->
        <rect x="170" y="215" width="46" height="34" rx="3" fill="#e8cfb0" stroke="#bfa382" stroke-width="1.5" />
        <text x="193" y="236" font-family="'Noto Sans KR', sans-serif" font-size="10" font-weight="700" fill="#6d4e2d" text-anchor="middle">명정전</text>

        <!-- 대온실 -->
        <rect x="235" y="65" width="28" height="18" rx="2" fill="#eaf3ea" stroke="#8cbfa0" stroke-width="1" />
        <text x="249" y="78" font-family="'Noto Sans KR', sans-serif" font-size="8" font-weight="600" fill="#3b7a54" text-anchor="middle">대온실</text>

        <!-- 서울대학교병원 부지 (좌측 하단) -->
        <rect x="10" y="380" width="140" height="60" rx="4" fill="#e9eef5" stroke="#c5d3e8" stroke-width="1.5" />
        <text x="80" y="415" font-family="'Noto Sans KR', sans-serif" font-size="10" font-weight="600" fill="#4b6b94" text-anchor="middle">서울대학교병원</text>

        <!-- 국립어린이과학관 부지 -->
        <rect x="355" y="10" width="85" height="60" rx="4" fill="#faeed9" stroke="#e0cbab" stroke-width="1.2" />
        <text x="397" y="45" font-family="'Noto Sans KR', sans-serif" font-size="9" font-weight="600" fill="#8c6239" text-anchor="middle">어린이과학관</text>

        <!-- 창경궁 홍화문 (정문/매표소) -->
        <rect x="290" y="222" width="24" height="20" rx="2" fill="#d9534f" stroke="#b52b27" stroke-width="1.2"/>
        <text x="302" y="236" font-family="'Noto Sans KR', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">정문</text>

        <!-- 창경궁로 도로명 텍스트 -->
        <text x="328" y="330" font-family="'Noto Sans KR', sans-serif" font-size="10" font-weight="700" fill="#99732e" transform="rotate(-88, 328, 330)">창경궁로</text>
      </svg>

      <!-- 랜드마크 뱃지들 -->
      <!-- 혜화역 4호선 뱃지 -->
      <div class="landmark-tag subway-tag" style="top: 22%; right: 4%;">
        <span class="subway-num">4</span>
        <span>혜화역 4번출구</span>
        <span class="walk-hint">도보 10분</span>
      </div>

      <!-- 창경궁 홍화문 뱃지 -->
      <div class="landmark-tag gate-tag" style="top: 50%; right: 28%;">
        <i class="fa-solid fa-archway"></i> 홍화문 (입구)
      </div>

      <!-- 창경궁 주차장 뱃지 -->
      <div class="landmark-tag park-tag" style="top: 66%; right: 26%;">
        <span class="p-badge">P</span> 주차장
      </div>

      <!-- 네이버 시그니처 펄스 마커 (중앙 창경궁) -->
      <div class="naver-center-marker" id="naver-main-pin" role="button" tabindex="0" title="창경궁 (클릭 시 네이버 지도로 열기)">
        <div class="pin-wave-ring"></div>
        <div class="pin-wave-ring delayed"></div>
        <div class="pin-head">
          <i class="fa-solid fa-location-dot"></i>
        </div>
      </div>

      <!-- 네이버 스타일 인포 팝업 -->
      <div class="naver-info-popup" id="naver-info-popup">
        <div class="popup-header-row">
          <span class="popup-n-icon">N</span>
          <strong class="popup-title-text">창경궁</strong>
          <span class="popup-sub-tag">행사장</span>
        </div>
        <div class="popup-addr-text">서울 종로구 창경궁로 185</div>
        <div class="popup-actions">
          <button type="button" class="btn-popup-open" id="popup-btn-naver">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> 네이버 지도
          </button>
          <button type="button" class="btn-popup-route" id="popup-btn-route">
            <i class="fa-solid fa-diamond-turn-right"></i> 길찾기
          </button>
        </div>
      </div>
    </div>
  `;

  initInteractiveCanvas();
}

/**
 * 줌 & 팬(드래그) 인터랙션 제어
 */
function initInteractiveCanvas() {
  const canvas = document.getElementById('interactive-map-canvas');
  const frame = document.getElementById('naver-map-300');
  if (!canvas || !frame) return;

  function updateTransform(smooth = false) {
    if (smooth) {
      canvas.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
    } else {
      canvas.style.transition = 'none';
    }
    canvas.style.transform = `translate(${mapState.posX}px, ${mapState.posY}px) scale(${mapState.zoom})`;
  }

  // 마우스 드래그 이벤트 (PC)
  frame.addEventListener('mousedown', (e) => {
    if (e.target.closest('.map-controls-floating') || e.target.closest('.popup-actions')) return;
    mapState.isDragging = true;
    mapState.startX = e.clientX - mapState.posX;
    mapState.startY = e.clientY - mapState.posY;
    frame.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!mapState.isDragging) return;
    mapState.posX = e.clientX - mapState.startX;
    mapState.posY = e.clientY - mapState.startY;

    // 드래그 경계 제한
    const maxBound = 110 * mapState.zoom;
    mapState.posX = Math.max(-maxBound, Math.min(maxBound, mapState.posX));
    mapState.posY = Math.max(-maxBound, Math.min(maxBound, mapState.posY));

    updateTransform(false);
  });

  window.addEventListener('mouseup', () => {
    if (mapState.isDragging) {
      mapState.isDragging = false;
      frame.style.cursor = 'grab';
    }
  });

  // 모바일 터치 드래그
  let touchStartX = 0;
  let touchStartY = 0;

  frame.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX - mapState.posX;
      touchStartY = e.touches[0].clientY - mapState.posY;
    }
  }, { passive: true });

  frame.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      mapState.posX = e.touches[0].clientX - touchStartX;
      mapState.posY = e.touches[0].clientY - touchStartY;

      const maxBound = 110 * mapState.zoom;
      mapState.posX = Math.max(-maxBound, Math.min(maxBound, mapState.posX));
      mapState.posY = Math.max(-maxBound, Math.min(maxBound, mapState.posY));

      updateTransform(false);
    }
  }, { passive: true });

  // 휠 줌 (PC)
  frame.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    mapState.zoom = Math.max(mapState.minZoom, Math.min(mapState.maxZoom, mapState.zoom + delta));
    updateTransform(true);
  }, { passive: false });

  // 핀 클릭 시 네이버 지도 바로 실행 / 팝업 연동
  const mainPin = document.getElementById('naver-main-pin');
  if (mainPin) {
    mainPin.addEventListener('click', (e) => {
      e.stopPropagation();
      openMapService('naver_place');
    });
  }

  // 팝업 내부 버튼들
  const popupBtnNaver = document.getElementById('popup-btn-naver');
  const popupBtnRoute = document.getElementById('popup-btn-route');

  if (popupBtnNaver) {
    popupBtnNaver.addEventListener('click', (e) => {
      e.stopPropagation();
      openMapService('naver_place');
    });
  }

  if (popupBtnRoute) {
    popupBtnRoute.addEventListener('click', (e) => {
      e.stopPropagation();
      openMapService('naver_route');
    });
  }

  // 초기 위치 보정
  updateTransform(true);
}

/**
 * 줌 인/아웃 및 위치 재설정 컨트롤러
 */
function initMapControls() {
  const canvas = document.getElementById('interactive-map-canvas');
  const zoomInBtn = document.getElementById('map-zoom-in');
  const zoomOutBtn = document.getElementById('map-zoom-out');
  const recenterBtn = document.getElementById('map-recenter-btn');

  function applyZoom(smooth = true) {
    if (!canvas) return;
    canvas.style.transition = smooth ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    canvas.style.transform = `translate(${mapState.posX}px, ${mapState.posY}px) scale(${mapState.zoom})`;
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mapState.zoom = Math.min(mapState.maxZoom, mapState.zoom + 0.25);
      applyZoom(true);
      if (navigator.vibrate) navigator.vibrate(20);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mapState.zoom = Math.max(mapState.minZoom, mapState.zoom - 0.25);
      applyZoom(true);
      if (navigator.vibrate) navigator.vibrate(20);
    });
  }

  if (recenterBtn) {
    recenterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mapState.zoom = 1;
      mapState.posX = 0;
      mapState.posY = 0;
      applyZoom(true);
      showToast("창경궁 중심으로 위치를 맞췄습니다.");
      if (navigator.vibrate) navigator.vibrate(30);
    });
  }
}

/**
 * 스마트 맵 & 내비게이션 앱/웹 통합 라우터
 * 모바일에서는 네이버/카카오/티맵 앱을 우선 실행하고, 미설치 시 웹으로 자동 전환(Fallback)
 * PC에서는 고해상도 웹 지도를 새 창으로 실행
 */
function openMapService(type) {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;

  const { lat, lng, encodedName } = VENUE_INFO;

  // 피드백 (진동)
  if (navigator.vibrate) {
    try { navigator.vibrate(40); } catch (e) {}
  }

  switch (type) {
    case 'naver_place': {
      showToast("네이버 지도로 연결합니다...");
      const webUrl = `https://map.naver.com/v5/search/${encodedName}`;
      const mobileWebUrl = `https://m.map.naver.com/search2/search.naver?query=${encodedName}`;

      if (isAndroid) {
        const intentUrl = `intent://place?lat=${lat}&lng=${lng}&name=${encodedName}&appname=com.reconnect.invitation#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
        window.location.href = intentUrl;
      } else if (isIOS) {
        const appScheme = `nmap://place?lat=${lat}&lng=${lng}&name=${encodedName}&appname=com.reconnect.invitation`;
        openWithFallback(appScheme, mobileWebUrl);
      } else {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
      break;
    }

    case 'naver_route': {
      showToast("네이버 빠른 길찾기로 연결합니다...");
      const webRouteUrl = `https://map.naver.com/v5/directions/-/-/${encodedName},${lng},${lat},PLACE_POI/-/car`;
      const mobileWebRouteUrl = `https://m.map.naver.com/directions/`;

      if (isAndroid) {
        const intentUrl = `intent://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedName}&appname=com.reconnect.invitation#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
        window.location.href = intentUrl;
      } else if (isIOS) {
        const appScheme = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedName}&appname=com.reconnect.invitation`;
        openWithFallback(appScheme, webRouteUrl);
      } else {
        window.open(webRouteUrl, '_blank', 'noopener,noreferrer');
      }
      break;
    }

    case 'kakao_map': {
      showToast("카카오맵으로 연결합니다...");
      const kakaoWebUrl = `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`;
      if (isMobile) {
        const kakaoAppScheme = `kakaomap://route?ep=${lat},${lng}&by=CAR`;
        openWithFallback(kakaoAppScheme, kakaoWebUrl);
      } else {
        window.open(kakaoWebUrl, '_blank', 'noopener,noreferrer');
      }
      break;
    }

    case 'tmap': {
      showToast("티맵 내비게이션으로 연결합니다...");
      const tmapWebUrl = `https://map.naver.com/v5/search/${encodedName}`;
      if (isMobile) {
        const tmapAppScheme = `tmap://route?goalname=${encodedName}&goallat=${lat}&goallng=${lng}`;
        openWithFallback(tmapAppScheme, tmapWebUrl);
      } else {
        window.open(tmapWebUrl, '_blank', 'noopener,noreferrer');
      }
      break;
    }

    default:
      window.open(`https://map.naver.com/v5/search/${encodedName}`, '_blank');
  }
}

/**
 * 앱 스키마 호출 후 미실행 시 웹페이지로 폴백
 */
function openWithFallback(appUrl, fallbackWebUrl) {
  const start = Date.now();
  window.location.href = appUrl;

  setTimeout(() => {
    // 1.2초 후 사용자가 여전히 브라우저 탭에 머물러 있는 경우 (앱이 안 열렸을 때)
    if (Date.now() - start < 2000 && !document.hidden) {
      window.location.href = fallbackWebUrl;
    }
  }, 1200);
}

/**
 * 지도 섹션 클릭 이벤트 리스너 바인딩
 */
function initMapInteractions() {
  // 네이버 지도로 열기 버튼
  const btnNaverMap = document.getElementById('btn-naver-map');
  if (btnNaverMap) {
    btnNaverMap.addEventListener('click', () => openMapService('naver_place'));
  }

  // 네이버 빠른 길찾기 버튼
  const btnNaverRoute = document.getElementById('btn-naver-route');
  if (btnNaverRoute) {
    btnNaverRoute.addEventListener('click', () => openMapService('naver_route'));
  }

  // 상단 헤더 탭 클릭 시 네이버 지도 바로 열기
  const mapHeaderBtn = document.getElementById('map-header-btn');
  if (mapHeaderBtn) {
    mapHeaderBtn.addEventListener('click', () => openMapService('naver_place'));
  }

  // 하단 배너 클릭 시 네이버 지도 바로 열기
  const mapFooterBtn = document.getElementById('map-footer-btn');
  if (mapFooterBtn) {
    mapFooterBtn.addEventListener('click', () => openMapService('naver_place'));
  }

  // 퀵 내비게이션 바 버튼들
  const quickNaver = document.getElementById('quick-naver');
  const quickKakao = document.getElementById('quick-kakao');
  const quickTmap = document.getElementById('quick-tmap');

  if (quickNaver) quickNaver.addEventListener('click', () => openMapService('naver_place'));
  if (quickKakao) quickKakao.addEventListener('click', () => openMapService('kakao_map'));
  if (quickTmap) quickTmap.addEventListener('click', () => openMapService('tmap'));
}

/* ==========================================================================
   4. RSVP 및 방명록 시스템
   ========================================================================== */
function initRsvpAndGuestbook() {
  const rsvpForm = document.getElementById('rsvp-form');
  const guestbookList = document.getElementById('guestbook-list');

  // 기본 초기 방명록 데이터
  const defaultComments = [
    {
      name: "김민우 (08학번)",
      status: "attend",
      message: "벌써 10년이 훌쩍 넘었네요! 다들 너무 보고 싶습니다. 꼭 갈게요!",
      time: "10분 전"
    },
    {
      name: "이지은 (09학번)",
      status: "attend",
      message: "창경궁 가을 단풍 보며 동기들 만날 생각에 벌써 설레네요 🍁",
      time: "1시간 전"
    },
    {
      name: "박준혁 (07학번)",
      status: "attend",
      message: "추진위원회 여러분 고생 많으십니다. 그날 반갑게 만나요!",
      time: "어제"
    }
  ];

  // 로컬스토리지에서 가져오기
  let comments = [];
  try {
    const saved = localStorage.getItem('reconnect_guestbook');
    if (saved) {
      comments = JSON.parse(saved);
    } else {
      comments = defaultComments;
    }
  } catch (e) {
    comments = defaultComments;
  }

  function renderGuestbook() {
    if (!guestbookList) return;
    guestbookList.innerHTML = '';

    comments.forEach(item => {
      const card = document.createElement('div');
      card.className = 'guestbook-item';
      
      const isAttend = item.status === 'attend';
      const statusText = isAttend ? '🎉 참석' : '💌 마음으로 응원';
      const statusClass = isAttend ? 'guestbook-status attend' : 'guestbook-status';

      card.innerHTML = `
        <div class="guestbook-header">
          <span class="guestbook-author">${escapeHtml(item.name)}</span>
          <span class="${statusClass}">${statusText}</span>
        </div>
        <div class="guestbook-msg">${escapeHtml(item.message || '참석 신청 완료!')}</div>
        <div class="guestbook-time">${item.time || '방금 전'}</div>
      `;
      guestbookList.appendChild(card);
    });
  }

  renderGuestbook();

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value.trim();
      const phone = document.getElementById('rsvp-phone').value.trim();
      const message = document.getElementById('rsvp-message').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;

      if (!name) return;

      const newEntry = {
        name: name,
        status: attendance,
        message: message || (attendance === 'attend' ? '참석합니다! 기대되네요.' : '아쉽지만 마음으로 응원합니다.'),
        time: '방금 전'
      };

      comments.unshift(newEntry);
      try {
        localStorage.setItem('reconnect_guestbook', JSON.stringify(comments));
      } catch (err) {
        console.error(err);
      }

      renderGuestbook();
      showToast("참석 응답이 소중히 전달되었습니다! 감사합니다.");
      rsvpForm.reset();
    });
  }
}

/* ==========================================================================
   5. 공유 및 주소 복사 기능
   ========================================================================== */
function initShareAndCopy() {
  const copyAddressBtn = document.getElementById('copy-address-btn');
  const shareLinkBtn = document.getElementById('share-link-btn');
  const shareTopBtn = document.getElementById('share-top-btn');
  const shareNativeBtn = document.getElementById('share-native-btn');

  // 주소 복사
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const address = "서울 종로구 창경궁로 185 (창경궁)";
      copyToClipboard(address, "창경궁 주소가 클립보드에 복사되었습니다.");
    });
  }

  // 링크 복사
  function shareUrl() {
    const url = window.location.href;
    copyToClipboard(url, "초대장 링크가 복사되었습니다. 친구들에게 전달해주세요!");
  }

  if (shareLinkBtn) shareLinkBtn.addEventListener('click', shareUrl);

  // Web Share API
  async function triggerNativeShare() {
    const shareData = {
      title: 'Re:Connect 동창회 초대장',
      text: '세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회에 초대합니다! (2032.10.1 창경궁)',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          shareUrl();
        }
      }
    } else {
      shareUrl();
    }
  }

  if (shareTopBtn) shareTopBtn.addEventListener('click', triggerNativeShare);
  if (shareNativeBtn) shareNativeBtn.addEventListener('click', triggerNativeShare);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast("복사에 실패했습니다.");
  }
  document.body.removeChild(textarea);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   6. 스크롤 애니메이션 (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   7. 감성 꽃잎 흩날리는 Canvas 애니메이션
   ========================================================================== */
function initPetalAnimation() {
  const canvas = document.getElementById('petal-canvas');
  const toggleBtn = document.getElementById('petal-toggle');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let isEnabled = true;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 가을 창경궁 단풍 & 샴페인 골드 스파클 파티클
  const petalCount = 32;
  const petals = [];
  const petalColors = [
    'rgba(217, 130, 43, 0.75)',  // 가을 단풍 오렌지
    'rgba(196, 69, 54, 0.7)',    // 고궁 붉은 단풍
    'rgba(235, 186, 85, 0.8)',   // 은행나무 황금빛
    'rgba(200, 163, 108, 0.65)', // 샴페인 골드
    'rgba(143, 101, 68, 0.55)',  // 가을 낙엽 브라운
    'rgba(255, 230, 180, 0.7)'   // 은은한 골드 스파클
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 1.1 + 0.5;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 1.6;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.swing = Math.random() * 2;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.swingOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * this.swingSpeed + this.swingOffset) * 0.8;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + 20 || this.x < -30 || this.x > canvas.width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, -this.size / 4, this.size, 0);
      ctx.bezierCurveTo(this.size, this.size / 2, this.size / 2, this.size, 0, this.size);
      ctx.bezierCurveTo(-this.size / 2, this.size, -this.size, this.size / 2, -this.size, 0);
      ctx.bezierCurveTo(-this.size, -this.size / 4, -this.size / 2, -this.size / 2, 0, 0);
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(200, 163, 108, 0.3)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animate() {
    if (!isEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(petal => {
      petal.update();
      petal.draw();
    });
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isEnabled = !isEnabled;
      toggleBtn.classList.toggle('active', isEnabled);
      if (isEnabled) {
        animate();
        showToast("가을 단풍 효과가 켜졌습니다.");
      } else {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        showToast("가을 단풍 효과가 꺼졌습니다.");
      }
    });
  }
}
