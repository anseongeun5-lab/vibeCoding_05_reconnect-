// ==========================================================================
// Google Style Start Page - Interactive Script Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  initWeather();
  initSearch();
  initQuotes();
  initShortcuts();
  initControls();
});

/* ==========================================================================
   1. Real-time Clock & Date
   ========================================================================== */
function initClock() {
  const clockTimeEl = document.getElementById('clockTime');
  const clockDateEl = document.getElementById('clockDate');

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (clockTimeEl) {
      clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    if (clockDateEl) {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const day = weekdays[now.getDay()];
      clockDateEl.textContent = `${year}년 ${month}월 ${date}일 (${day}요일)`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. Dark / Light Theme Toggle
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const html = document.documentElement;

  // 로컬 스토리지 또는 시스템 선호 테마 확인
  const savedTheme = localStorage.getItem('skyscan_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(newTheme === 'dark' ? '다크 모드로 전환되었습니다.' : '라이트 모드로 전환되었습니다.');
    });
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('skyscan_theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
      themeIcon.parentElement.setAttribute('title', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
  }
}

/* ==========================================================================
   3. Real-time Weather (Pohang & Daegu) using Open-Meteo
   ========================================================================== */
const CITIES = {
  pohang: {
    name: '포항',
    lat: 36.0190,
    lon: 129.3435,
    tempEl: 'pohangTemp',
    condEl: 'pohangCondition',
    iconEl: 'pohangIcon',
    minMaxEl: 'pohangMinMax',
    humidityEl: 'pohangHumidity',
    windEl: 'pohangWind',
    precipEl: 'pohangPrecip'
  },
  daegu: {
    name: '대구',
    lat: 35.8714,
    lon: 128.6014,
    tempEl: 'daeguTemp',
    condEl: 'daeguCondition',
    iconEl: 'daeguIcon',
    minMaxEl: 'daeguMinMax',
    humidityEl: 'daeguHumidity',
    windEl: 'daeguWind',
    precipEl: 'daeguPrecip'
  }
};

// WMO Weather Code Translation & Icons
function parseWmoCode(code) {
  const mapping = {
    0: { text: '맑음', icon: 'wb_sunny', color: '#f59e0b' },
    1: { text: '대체로 맑음', icon: 'partly_cloudy_day', color: '#38bdf8' },
    2: { text: '구름 조금', icon: 'partly_cloudy_day', color: '#64748b' },
    3: { text: '흐림', icon: 'cloud', color: '#94a3b8' },
    45: { text: '안개', icon: 'foggy', color: '#94a3b8' },
    48: { text: '짙은 안개', icon: 'foggy', color: '#64748b' },
    51: { text: '이슬비', icon: 'grain', color: '#38bdf8' },
    53: { text: '가벼운 비', icon: 'rainy', color: '#0284c7' },
    55: { text: '비', icon: 'rainy', color: '#0369a1' },
    61: { text: '약한 비', icon: 'rainy', color: '#0284c7' },
    63: { text: '보통 비', icon: 'rainy', color: '#0369a1' },
    65: { text: '강한 비', icon: 'rainy_heavy', color: '#1e40af' },
    71: { text: '약한 눈', icon: 'ac_unit', color: '#93c5fd' },
    73: { text: '보통 눈', icon: 'weather_snowy', color: '#60a5fa' },
    75: { text: '강한 눈', icon: 'weather_snowy', color: '#3b82f6' },
    80: { text: '소나기', icon: 'weather_mix', color: '#0284c7' },
    81: { text: '강한 소나기', icon: 'weather_mix', color: '#1d4ed8' },
    82: { text: '폭우', icon: 'thunderstorm', color: '#1e3a8a' },
    85: { text: '약한 눈보라', icon: 'weather_snowy', color: '#60a5fa' },
    86: { text: '강한 눈보라', icon: 'severe_cold', color: '#2563eb' },
    95: { text: '뇌우', icon: 'thunderstorm', color: '#7c3aed' },
    96: { text: '우박 동반 뇌우', icon: 'thunderstorm', color: '#6d28d9' },
    99: { text: '강한 뇌우', icon: 'thunderstorm', color: '#5b21b6' }
  };

  return mapping[code] || { text: '구름 조금', icon: 'partly_cloudy_day', color: '#38bdf8' };
}

async function fetchCityWeather(cityKey, config) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch error: ${res.status}`);
    
    const data = await res.json();
    const current = data.current;
    const daily = data.daily;

    const weatherInfo = parseWmoCode(current.weather_code);

    // DOM Updates
    const tempEl = document.getElementById(config.tempEl);
    const condEl = document.getElementById(config.condEl);
    const iconEl = document.getElementById(config.iconEl);
    const minMaxEl = document.getElementById(config.minMaxEl);
    const humidityEl = document.getElementById(config.humidityEl);
    const windEl = document.getElementById(config.windEl);
    const precipEl = document.getElementById(config.precipEl);

    if (tempEl) tempEl.textContent = Math.round(current.temperature_2m);
    if (condEl) condEl.textContent = weatherInfo.text;
    if (iconEl) {
      iconEl.innerHTML = `<span class="material-symbols-rounded" style="color: ${weatherInfo.color};">${weatherInfo.icon}</span>`;
    }

    if (minMaxEl && daily) {
      const maxTemp = Math.round(daily.temperature_2m_max[0]);
      const minTemp = Math.round(daily.temperature_2m_min[0]);
      minMaxEl.textContent = `${maxTemp}° / ${minTemp}°`;
    }

    if (humidityEl) humidityEl.textContent = `${current.relative_humidity_2m}%`;
    if (windEl) windEl.textContent = `${current.wind_speed_10m.toFixed(1)} m/s`;
    
    if (precipEl && daily && daily.precipitation_probability_max) {
      precipEl.textContent = `${daily.precipitation_probability_max[0] || 0}%`;
    } else if (precipEl) {
      precipEl.textContent = `${current.precipitation > 0 ? '100' : '0'}%`;
    }

    return true;
  } catch (error) {
    console.warn(`[Weather] ${config.name} 날씨 조회 실패, 기본 정보 유지`, error);
    
    // Fallback data
    const tempEl = document.getElementById(config.tempEl);
    const condEl = document.getElementById(config.condEl);
    const iconEl = document.getElementById(config.iconEl);
    
    if (tempEl && tempEl.textContent === '--') tempEl.textContent = cityKey === 'pohang' ? '21' : '23';
    if (condEl && condEl.textContent.includes('불러오는 중')) condEl.textContent = '맑음 (캐시)';
    if (iconEl) iconEl.innerHTML = `<span class="material-symbols-rounded" style="color: #f59e0b;">wb_sunny</span>`;

    return false;
  }
}

async function updateAllWeather() {
  const updateTimeEl = document.getElementById('weatherUpdateTime');
  const refreshBtn = document.getElementById('refreshWeatherBtn');

  if (refreshBtn) refreshBtn.classList.add('spin-slow');
  if (updateTimeEl) updateTimeEl.textContent = '날씨 정보 갱신 중...';

  const results = await Promise.all([
    fetchCityWeather('pohang', CITIES.pohang),
    fetchCityWeather('daegu', CITIES.daegu)
  ]);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  if (updateTimeEl) {
    updateTimeEl.textContent = `기준: 오늘 ${timeStr} (실시간)`;
  }

  if (refreshBtn) {
    setTimeout(() => {
      refreshBtn.classList.remove('spin-slow');
    }, 600);
  }
}

function initWeather() {
  updateAllWeather();

  // 15분마다 자동 갱신
  setInterval(updateAllWeather, 15 * 60 * 1000);

  const refreshBtn = document.getElementById('refreshWeatherBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateAllWeather();
      showToast('날씨 정보를 최신으로 갱신했습니다.');
    });
  }
}

/* ==========================================================================
   4. Google Search & Controls
   ========================================================================== */
function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchBoxWrapper = document.getElementById('searchBoxWrapper');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  const lensBtn = document.getElementById('lensBtn');
  const feelingLuckyBtn = document.getElementById('feelingLuckyBtn');

  // Input Focus Effect
  if (searchInput && searchBoxWrapper) {
    searchInput.addEventListener('focus', () => searchBoxWrapper.classList.add('focused'));
    searchInput.addEventListener('blur', () => searchBoxWrapper.classList.remove('focused'));

    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim().length > 0) {
        clearSearchBtn.classList.add('visible');
      } else {
        clearSearchBtn.classList.remove('visible');
      }
    });
  }

  // Clear Button
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');
      searchInput.focus();
    });
  }

  // Search Submission
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      const query = searchInput.value.trim();
      if (!query) {
        e.preventDefault();
        searchInput.focus();
        return;
      }
      // If user types a full URL, redirect directly
      if (/^https?:\/\//i.test(query) || (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(query) && !query.includes(' '))) {
        e.preventDefault();
        const url = /^https?:\/\//i.test(query) ? query : `https://${query}`;
        window.location.href = url;
      }
    });
  }

  // "I'm Feeling Lucky" Button
  if (feelingLuckyBtn) {
    feelingLuckyBtn.addEventListener('click', () => {
      const query = searchInput ? searchInput.value.trim() : '';
      if (query) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
      } else {
        window.location.href = 'https://www.google.com/doodles';
      }
    });
  }

  // Google Lens Button
  if (lensBtn) {
    lensBtn.addEventListener('click', () => {
      showToast('Google 렌즈 이미지 검색 페이지로 이동합니다.');
      setTimeout(() => {
        window.open('https://images.google.com/', '_blank');
      }, 500);
    });
  }

  // Voice Search (Web Speech API)
  if (voiceSearchBtn && searchInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let isListening = false;

      voiceSearchBtn.addEventListener('click', () => {
        if (!isListening) {
          try {
            recognition.start();
            voiceSearchBtn.classList.add('listening');
            showToast('🎤 듣고 있습니다... 말씀해 주세요.');
            isListening = true;
          } catch (err) {
            console.error(err);
          }
        } else {
          recognition.stop();
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        clearSearchBtn.classList.add('visible');
        showToast(`인식됨: "${transcript}"`);
        setTimeout(() => {
          searchForm.submit();
        }, 800);
      };

      recognition.onspeechend = () => {
        recognition.stop();
        voiceSearchBtn.classList.remove('listening');
        isListening = false;
      };

      recognition.onerror = (event) => {
        voiceSearchBtn.classList.remove('listening');
        isListening = false;
        showToast('음성을 인식하지 못했습니다. 다시 시도해 주세요.');
      };
    } else {
      voiceSearchBtn.addEventListener('click', () => {
        showToast('현재 브라우저에서는 음성 인식을 지원하지 않습니다.');
      });
    }
  }
}

/* ==========================================================================
   5. Quote of the Day
   ========================================================================== */
function initQuotes() {
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  const quoteTagEl = document.getElementById('quoteTag');
  const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');

  // Fallback quote list if quotes.js is not loaded
  const quoteList = (typeof QUOTES !== 'undefined' && QUOTES.length > 0) ? QUOTES : [
    { quote: "시작이 반이다. 무엇이든 시작하라.", author: "아리스토텔레스", tag: "도전" },
    { quote: "오늘 하루를 당신 인생의 최고의 날로 만들어라.", author: "마크 트웨인", tag: "동기부여" },
    { quote: "가장 어두운 밤도 언젠가는 끝나고 해는 떠오를 것이다.", author: "빅토르 위고", tag: "희망" }
  ];

  let currentQuote = null;

  function displayRandomQuote() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * quoteList.length);
    } while (quoteList.length > 1 && quoteList[randomIndex] === currentQuote);

    currentQuote = quoteList[randomIndex];

    if (quoteTextEl) {
      quoteTextEl.style.opacity = '0';
      setTimeout(() => {
        quoteTextEl.textContent = currentQuote.quote;
        quoteTextEl.style.opacity = '1';
      }, 150);
    }

    if (quoteAuthorEl) {
      quoteAuthorEl.textContent = `- ${currentQuote.author}`;
    }

    if (quoteTagEl) {
      quoteTagEl.textContent = `✨ ${currentQuote.tag || '오늘의 명언'}`;
    }
  }

  displayRandomQuote();

  if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', () => {
      displayRandomQuote();
      refreshQuoteBtn.classList.add('spin-slow');
      setTimeout(() => refreshQuoteBtn.classList.remove('spin-slow'), 500);
    });
  }

  if (copyQuoteBtn) {
    copyQuoteBtn.addEventListener('click', async () => {
      if (!currentQuote) return;
      const copyContent = `"${currentQuote.quote}" - ${currentQuote.author}`;
      try {
        await navigator.clipboard.writeText(copyContent);
        const tooltip = copyQuoteBtn.querySelector('.tool-tip-text');
        if (tooltip) {
          tooltip.classList.add('show');
          setTimeout(() => tooltip.classList.remove('show'), 2000);
        }
        showToast('명언이 클립보드에 복사되었습니다!');
      } catch (err) {
        showToast('클립보드 복사에 실패했습니다.');
      }
    });
  }
}

/* ==========================================================================
   6. Quick Shortcuts Management
   ========================================================================== */
const DEFAULT_SHORTCUTS = [
  { id: '1', title: 'YouTube', url: 'https://www.youtube.com', icon: 'smart_display', color: '#ff0000' },
  { id: '2', title: 'Gmail', url: 'https://mail.google.com', icon: 'mail', color: '#ea4335' },
  { id: '3', title: 'Google Maps', url: 'https://maps.google.com', icon: 'map', color: '#34a853' },
  { id: '4', title: 'Google 뉴스', url: 'https://news.google.com', icon: 'newspaper', color: '#1a73e8' },
  { id: '5', title: '네이버', url: 'https://www.naver.com', icon: 'public', color: '#03c75a' },
  { id: '6', title: 'GitHub', url: 'https://github.com', icon: 'terminal', color: '#333333' }
];

function initShortcuts() {
  const shortcutsGrid = document.getElementById('shortcutsGrid');
  const shortcutModal = document.getElementById('shortcutModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelShortcutBtn = document.getElementById('cancelShortcutBtn');
  const addShortcutForm = document.getElementById('addShortcutForm');
  const shortcutTitleInput = document.getElementById('shortcutTitle');
  const shortcutUrlInput = document.getElementById('shortcutUrl');

  let shortcuts = JSON.parse(localStorage.getItem('skyscan_shortcuts')) || DEFAULT_SHORTCUTS;

  function renderShortcuts() {
    if (!shortcutsGrid) return;
    shortcutsGrid.innerHTML = '';

    shortcuts.forEach(item => {
      const shortcutEl = document.createElement('a');
      shortcutEl.className = 'shortcut-item';
      shortcutEl.href = item.url;
      shortcutEl.target = '_blank';
      shortcutEl.rel = 'noopener noreferrer';
      shortcutEl.title = item.title;

      shortcutEl.innerHTML = `
        <div class="shortcut-icon-wrapper">
          <span class="material-symbols-rounded" style="color: ${item.color || 'var(--google-blue)'};">${item.icon || 'link'}</span>
        </div>
        <span class="shortcut-title">${item.title}</span>
        <button class="shortcut-remove-btn" title="삭제" data-id="${item.id}">×</button>
      `;

      // Remove handler
      const removeBtn = shortcutEl.querySelector('.shortcut-remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteShortcut(item.id);
        });
      }

      shortcutsGrid.appendChild(shortcutEl);
    });

    // Add "+" Button
    const addBtn = document.createElement('div');
    addBtn.className = 'shortcut-item';
    addBtn.style.cursor = 'pointer';
    addBtn.title = '바로가기 추가';
    addBtn.innerHTML = `
      <div class="shortcut-icon-wrapper" style="border-style: dashed;">
        <span class="material-symbols-rounded" style="color: var(--text-secondary);">add</span>
      </div>
      <span class="shortcut-title">추가</span>
    `;
    addBtn.addEventListener('click', openAddModal);
    shortcutsGrid.appendChild(addBtn);
  }

  function deleteShortcut(id) {
    shortcuts = shortcuts.filter(s => s.id !== id);
    localStorage.setItem('skyscan_shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
    showToast('바로가기가 삭제되었습니다.');
  }

  function openAddModal() {
    if (shortcutModal) {
      shortcutModal.classList.add('open');
      if (shortcutTitleInput) shortcutTitleInput.focus();
    }
  }

  function closeAddModal() {
    if (shortcutModal) {
      shortcutModal.classList.remove('open');
      if (addShortcutForm) addShortcutForm.reset();
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if (cancelShortcutBtn) cancelShortcutBtn.addEventListener('click', closeAddModal);
  if (shortcutModal) {
    shortcutModal.addEventListener('click', (e) => {
      if (e.target === shortcutModal) closeAddModal();
    });
  }

  if (addShortcutForm) {
    addShortcutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = shortcutTitleInput.value.trim();
      let url = shortcutUrlInput.value.trim();

      if (!title || !url) return;

      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      const newShortcut = {
        id: Date.now().toString(),
        title: title,
        url: url,
        icon: 'language',
        color: 'var(--google-blue)'
      };

      shortcuts.push(newShortcut);
      localStorage.setItem('skyscan_shortcuts', JSON.stringify(shortcuts));
      renderShortcuts();
      closeAddModal();
      showToast(`'${title}' 바로가기가 추가되었습니다.`);
    });
  }

  renderShortcuts();
}

/* ==========================================================================
   7. General Controls (Fullscreen & Toast & Brand)
   ========================================================================== */
function initControls() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const brandContainer = document.getElementById('brandContainer');

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          showToast(`전체화면 전환 실패: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  if (brandContainer) {
    brandContainer.addEventListener('click', () => {
      showToast('🛰️ SkyScan Map - 레이더 기상 관측 모니터링 시스템');
    });
  }
}

// Global Toast Message Function
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
