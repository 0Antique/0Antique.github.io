const initializePage = () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
  loadProjects();
};

window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const pinnedProjects = ['Auto-Visio-Helper', 'Code-helper', 'FedCDKD', 'CFRank'];

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

function projectCard(repository) {
  const isPinned = pinnedProjects.includes(repository.name);
  const description = repository.description || '这个项目暂时还没有简介。';
  const language = repository.language ? `<span>${escapeHtml(repository.language)}</span>` : '';
  const label = isPinned ? 'PINNED' : repository.fork ? 'FORK' : 'PUBLIC';
  return `
    <article class="project-card${isPinned ? ' is-pinned' : ''}">
      <div class="project-card-top">
        <span class="project-visibility">${label}</span>
        <span aria-label="星标数">★ ${repository.stargazers_count}</span>
      </div>
      <h2><a href="${repository.html_url}" target="_blank" rel="noreferrer">${escapeHtml(repository.name)} ↗</a></h2>
      <p>${escapeHtml(description)}</p>
      <div class="project-meta">${language}<span>更新于 ${new Date(repository.updated_at).toLocaleDateString('zh-CN')}</span></div>
    </article>`;
}

async function loadProjects() {
  const projectGrid = document.getElementById('project-grid');
  if (!projectGrid) return;
  const cachedProjects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const renderProjects = (repositories) => {
    repositories.sort((a, b) => {
      const aPinned = pinnedProjects.indexOf(a.name);
      const bPinned = pinnedProjects.indexOf(b.name);
      if (aPinned !== -1 || bPinned !== -1) {
        if (aPinned === -1) return 1;
        if (bPinned === -1) return -1;
        return aPinned - bPinned;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    projectGrid.innerHTML = repositories.map(projectCard).join('');
  };
  if (cachedProjects.length) renderProjects([...cachedProjects]);
  try {
    const response = await fetch('https://api.github.com/users/0Antique/repos?per_page=100&sort=updated');
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repositories = await response.json();
    renderProjects(repositories);
  } catch (error) {
    if (!cachedProjects.length) projectGrid.innerHTML = '<p class="project-state">项目暂时加载失败，请稍后重试或前往 <a href="https://github.com/0Antique?tab=repositories">GitHub</a> 查看。</p>';
  }
}

const MUSIC_STATE_KEY = 'antique_music_state';

const musicPlayer = document.createElement('aside');
musicPlayer.className = 'music-player';
musicPlayer.setAttribute('aria-label', '音乐播放器');

musicPlayer.innerHTML = `
  <button class="music-toggle" type="button" aria-label="播放日落大道" aria-pressed="false"><span class="music-record" aria-hidden="true"></span></button>
  <div class="music-info"><strong>日落大道</strong><span>梁博 · 点击播放</span></div>
  <span class="music-time">0:00 / 4:30</span>
  <div class="music-progress" aria-hidden="true"><i></i></div>
  <audio autoplay preload="auto" src="assets/audio/sunset-boulevard.m4a"></audio>
`;

document.body.appendChild(musicPlayer);

const audio = musicPlayer.querySelector('audio');
const musicToggle = musicPlayer.querySelector('.music-toggle');
const musicLabel = musicPlayer.querySelector('.music-info span');
const musicTime = musicPlayer.querySelector('.music-time');
const musicProgress = musicPlayer.querySelector('.music-progress i');

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

const saveMusicState = () => {
  sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
    currentTime: audio.currentTime || 0,
    playing: !audio.paused && !audio.ended
  }));
};

const updateMusicUI = () => {
  musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  musicProgress.style.width = `${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%`;
};

const restoreMusicState = () => {
  const rawState = sessionStorage.getItem(MUSIC_STATE_KEY);
  let state = {};
  try {
    if (rawState) state = JSON.parse(rawState) || {};
  } catch {
    state = {};
  }

  const restore = async () => {
    if (Number.isFinite(state.currentTime)) {
      audio.currentTime = Math.min(state.currentTime, audio.duration || state.currentTime);
      updateMusicUI();
    }

    try {
      await audio.play();
    } catch (error) {
      console.warn('Audio autoplay was rejected:', error.name, error.message);
      musicLabel.textContent = '浏览器已阻止自动播放 · 点击唱片播放';
    }
  };

  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
    restore();
  } else {
    audio.addEventListener('loadedmetadata', restore, { once: true });
  }
};

musicToggle.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      console.warn('Audio playback was rejected:', error.name, error.message);
      musicLabel.textContent = '播放失败，请刷新重试';
    }
  } else {
    audio.pause();
  }

  saveMusicState();
});

audio.addEventListener('play', () => {
  musicPlayer.classList.add('is-playing');
  musicToggle.setAttribute('aria-label', '暂停日落大道');
  musicToggle.setAttribute('aria-pressed', 'true');
  musicLabel.textContent = '梁博 · 正在播放';
  saveMusicState();
});

audio.addEventListener('pause', () => {
  musicPlayer.classList.remove('is-playing');
  musicToggle.setAttribute('aria-label', '播放日落大道');
  musicToggle.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = audio.ended ? '梁博 · 播放完毕' : '梁博 · 已暂停';
  saveMusicState();
});

audio.addEventListener('timeupdate', () => {
  updateMusicUI();
  saveMusicState();
});

audio.addEventListener('ended', () => {
  sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
    currentTime: 0,
    playing: false
  }));
});

window.addEventListener('beforeunload', saveMusicState);

restoreMusicState();

let navigationRequest = 0;

const navigateTo = async (url, { updateHistory = true } = {}) => {
  const requestId = ++navigationRequest;
  document.documentElement.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'soft-navigation' } });
    if (!response.ok) throw new Error(`Page request failed: ${response.status}`);

    const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    if (requestId !== navigationRequest) return;

    const selectors = ['.ambient', '.site-header', 'main', 'footer'];
    for (const selector of selectors) {
      const currentElement = document.querySelector(selector);
      const nextElement = nextDocument.querySelector(selector);
      if (!currentElement || !nextElement) throw new Error(`Missing page element: ${selector}`);
      currentElement.replaceWith(document.importNode(nextElement, true));
    }

    document.title = nextDocument.title;
    if (updateHistory) history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'auto' });
    initializePage();
  } catch (error) {
    console.warn('Soft navigation failed; using a normal page load.', error);
    window.location.assign(url);
  } finally {
    if (requestId === navigationRequest) document.documentElement.removeAttribute('aria-busy');
  }
};

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;

  const destination = new URL(link.href, window.location.href);
  const isSamePageHash = destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash;
  const isHtmlPage = destination.pathname.endsWith('.html') || destination.pathname.endsWith('/');
  if (destination.origin !== window.location.origin || isSamePageHash || !isHtmlPage) return;

  event.preventDefault();
  navigateTo(destination.href);
});

window.addEventListener('popstate', () => navigateTo(window.location.href, { updateHistory: false }));

initializePage();
