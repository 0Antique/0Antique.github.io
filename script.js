const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const header = document.querySelector('.site-header');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -60%' });

sections.forEach((section) => observer.observe(section));
if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

const projectGrid = document.getElementById('project-grid');
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

loadProjects();

const musicPlayer = document.createElement('aside');
musicPlayer.className = 'music-player';
musicPlayer.setAttribute('aria-label', '音乐播放器');
musicPlayer.innerHTML = `
  <button class="music-toggle" type="button" aria-label="播放日落大道" aria-pressed="false">▶</button>
  <div class="music-info"><strong>日落大道</strong><span>梁博 · 点击播放</span></div>
  <span class="music-time">0:00 / 4:30</span>
  <div class="music-progress" aria-hidden="true"><i></i></div>
  <audio preload="metadata" src="assets/audio/sunset-boulevard.m4a"></audio>`;
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
});

audio.addEventListener('play', () => {
  musicToggle.textContent = '❚❚';
  musicToggle.setAttribute('aria-label', '暂停日落大道');
  musicToggle.setAttribute('aria-pressed', 'true');
  musicLabel.textContent = '梁博 · 正在播放';
});
audio.addEventListener('pause', () => {
  musicToggle.textContent = '▶';
  musicToggle.setAttribute('aria-label', '播放日落大道');
  musicToggle.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = audio.ended ? '梁博 · 播放完毕' : '梁博 · 已暂停';
});
audio.addEventListener('timeupdate', () => {
  musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  musicProgress.style.width = `${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%`;
});
