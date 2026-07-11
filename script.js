const initializePage = () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
  loadProjects();
  initAntiqueGame();
};

window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const pinnedProjects = ['Auto-Visio-Helper', 'Code-helper', 'FedCDKD', 'CFRank'];

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

const readBrowserStorage = (storage, key) => {
  try {
    return storage?.getItem(key) || '';
  } catch (error) {
    console.warn('Browser storage read failed:', error.name, error.message);
    return '';
  }
};

const writeBrowserStorage = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
  } catch (error) {
    console.warn('Browser storage write failed:', error.name, error.message);
  }
};

function initAntiqueGame() {
  if (window.antiqueGameController) {
    window.antiqueGameController.destroy();
    window.antiqueGameController = null;
  }

  const canvas = document.getElementById('antique-game');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scoreNode = document.getElementById('game-score');
  const bestNode = document.getElementById('game-best');
  const startButton = document.getElementById('game-start');
  const pauseButton = document.getElementById('game-pause');
  const storageKey = 'antique_conference_runner_best';
  const width = 960;
  const height = 360;
  const groundY = 276;
  const pixel = 4;
  const colors = {
    ink: '#334f52',
    muted: '#718487',
    line: '#b7c8c7',
    ground: '#dcebe7',
    groundDark: '#9bb2b0',
    yellow: '#ffe66f',
    yellowDeep: '#f2c94c',
    brown: '#5b2f25',
    bandage: '#f2b980',
    bandageLight: '#fff9ea',
    shadow: 'rgba(51,79,82,.17)'
  };
  const logoImage = new Image();
  logoImage.src = 'assets/images/antique-smile-logo.png';
  logoImage.addEventListener('load', () => render());

  let animationFrame = 0;
  let lastTime = 0;
  let running = false;
  let started = false;
  let paused = false;
  let gameOver = false;
  let score = 0;
  let best = Number(readBrowserStorage(window.localStorage, storageKey)) || 0;
  let speed = 6;
  let nextSpawn = 520;
  let groundOffset = 0;
  let obstacles = [];
  let clouds = [];
  const player = {
    x: 86,
    y: groundY - 56,
    width: 56,
    height: 56,
    vy: 0,
    onGround: true,
    frame: 0
  };

  const formatScore = (value) => String(Math.floor(value)).padStart(5, '0');
  const updatePanel = () => {
    if (scoreNode) scoreNode.textContent = formatScore(score);
    if (bestNode) bestNode.textContent = formatScore(best);
    if (startButton) startButton.textContent = gameOver ? 'Restart' : started ? 'Jump' : 'Start';
    if (pauseButton) pauseButton.textContent = paused ? 'Resume' : 'Pause';
  };
  const random = (min, max) => min + Math.random() * (max - min);
  const snap = (value) => Math.round(value / pixel) * pixel;
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(snap(x), snap(y), snap(w), snap(h));
  };
  const text = (label, x, y, size = 14, color = colors.ink, align = 'center') => {
    ctx.fillStyle = color;
    ctx.font = `800 ${size}px "DM Sans", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, snap(x), snap(y));
  };

  const resizeCanvas = () => {
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  };

  const seedClouds = () => {
    clouds = [
      { x: 170, y: 58, w: 92, speed: .28 },
      { x: 520, y: 42, w: 126, speed: .21 },
      { x: 810, y: 84, w: 72, speed: .34 }
    ];
  };

  const reset = (playNow = false) => {
    cancelAnimationFrame(animationFrame);
    running = playNow;
    started = playNow;
    paused = false;
    gameOver = false;
    score = 0;
    speed = 6;
    nextSpawn = 520;
    groundOffset = 0;
    obstacles = [];
    seedClouds();
    Object.assign(player, {
      y: groundY - player.height,
      vy: 0,
      onGround: true,
      frame: 0
    });
    updatePanel();
    lastTime = performance.now();
    render();
    if (playNow) animationFrame = requestAnimationFrame(loop);
  };

  const spawnObstacle = () => {
    const variants = [
      { width: 18, height: 36, arms: 0 },
      { width: 22, height: 46, arms: 1 },
      { width: 28, height: 52, arms: 2 },
      { width: 42, height: 38, arms: 3 },
      { width: 54, height: 44, arms: 4 }
    ];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    const obstacle = {
      x: width + 24,
      width: variant.width,
      height: variant.height,
      arms: variant.arms
    };
    obstacle.y = groundY - obstacle.height;
    obstacles.push(obstacle);
  };

  const playerHitbox = () => ({
    x: player.x + 8,
    y: player.y + 8,
    width: player.width - 16,
    height: player.height - 12
  });

  const obstacleHitbox = (obstacle) => ({
    x: obstacle.x + 3,
    y: obstacle.y + 4,
    width: obstacle.width - 6,
    height: obstacle.height - 4
  });

  const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

  const endGame = () => {
    gameOver = true;
    running = false;
    started = true;
    best = Math.max(best, Math.floor(score));
    writeBrowserStorage(window.localStorage, storageKey, String(best));
    updatePanel();
    render();
  };

  const jump = () => {
    if (!started || gameOver) {
      reset(true);
      return;
    }
    if (paused || !player.onGround) return;
    player.vy = -12;
    player.onGround = false;
  };

  const drop = () => {
    if (!player.onGround && player.vy < 8) player.vy = 8;
  };

  const togglePause = () => {
    if (!started || gameOver) return;
    paused = !paused;
    running = !paused;
    updatePanel();
    if (running) {
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animationFrame);
      render();
    }
  };

  const update = (delta) => {
    speed = Math.min(13, speed + delta * .001);
    score += delta * speed * .1;
    groundOffset = (groundOffset + speed * delta) % 48;
    player.frame += delta;
    player.vy += .6 * delta;
    player.y += player.vy * delta;
    if (player.y >= groundY - player.height) {
      player.y = groundY - player.height;
      player.vy = 0;
      player.onGround = true;
    }

    nextSpawn -= speed * delta;
    if (nextSpawn <= 0) {
      spawnObstacle();
      nextSpawn = random(260, 460) + speed * random(18, 34);
    }

    obstacles.forEach((obstacle) => { obstacle.x -= speed * delta; });
    obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -24);
    clouds.forEach((cloud) => {
      cloud.x -= cloud.speed * delta;
      if (cloud.x + cloud.w < -20) cloud.x = width + random(40, 180);
    });

    const hitbox = playerHitbox();
    if (obstacles.some((obstacle) => overlaps(hitbox, obstacleHitbox(obstacle)))) endGame();
    best = Math.max(best, Math.floor(score));
    updatePanel();
  };

  const loop = (time) => {
    const delta = Math.min(2.2, (time - lastTime) / 16.666);
    lastTime = time;
    if (running) update(delta);
    render();
    if (running) animationFrame = requestAnimationFrame(loop);
  };

  const drawBackground = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fbfffb';
    ctx.fillRect(0, 0, width, height);
    clouds.forEach((cloud) => {
      rect(cloud.x, cloud.y + 16, cloud.w, 8, 'rgba(159,185,184,.23)');
      rect(cloud.x + 12, cloud.y + 8, cloud.w * .42, 8, 'rgba(159,185,184,.23)');
      rect(cloud.x + cloud.w * .48, cloud.y, cloud.w * .34, 8, 'rgba(159,185,184,.23)');
    });
    rect(0, groundY, width, 4, colors.ink);
    rect(0, groundY + 4, width, 84, colors.ground);
    for (let x = -groundOffset; x < width; x += 48) {
      rect(x, groundY + 16, 22, 3, colors.groundDark);
      rect(x + 31, groundY + 42, 13, 3, 'rgba(51,79,82,.18)');
    }
  };

  const pixelCircle = (cx, cy, radius, color, step = 4) => {
    for (let y = -radius; y <= radius; y += step) {
      const half = Math.sqrt(Math.max(0, radius * radius - y * y));
      rect(cx - half, cy + y, half * 2, step, color);
    }
  };

  const drawPlayer = () => {
    const x = player.x;
    const y = player.y;
    const cx = x + player.width / 2;
    const cy = y + player.height / 2;

    rect(x + 5, groundY + 8, 46, 4, colors.shadow);
    ctx.save();
    ctx.beginPath();
    ctx.arc(snap(cx), snap(cy), 28, 0, Math.PI * 2);
    ctx.clip();
    if (logoImage.complete && logoImage.naturalWidth) {
      ctx.drawImage(logoImage, snap(x), snap(y), player.width, player.height);
    } else {
      pixelCircle(cx, cy, 28, colors.brown);
      pixelCircle(cx, cy, 23, colors.yellow);
      rect(cx - 14, cy - 8, 6, 12, colors.brown);
      rect(cx + 9, cy - 8, 6, 12, colors.brown);
      rect(cx - 12, cy + 15, 24, 5, colors.brown);
    }
    ctx.restore();
  };

  const drawObstacle = (obstacle) => {
    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.width;
    const h = obstacle.height;
    rect(x + 2, groundY + 8, w, 4, colors.shadow);
    rect(x + Math.max(4, w * .34), y, Math.max(8, w * .32), h, colors.ink);
    if (obstacle.arms >= 1) {
      rect(x + Math.max(1, w * .16), y + h * .34, w * .25, 6, colors.ink);
      rect(x + Math.max(1, w * .16), y + h * .2, 6, h * .28, colors.ink);
    }
    if (obstacle.arms >= 2) {
      rect(x + w * .58, y + h * .48, w * .28, 6, colors.ink);
      rect(x + w * .78, y + h * .32, 6, h * .32, colors.ink);
    }
    if (obstacle.arms >= 3) {
      rect(x + w * .03, y + h * .08, w * .28, h * .86, colors.ink);
    }
    if (obstacle.arms >= 4) {
      rect(x + w * .7, y + h * .12, w * .27, h * .82, colors.ink);
    }
  };

  const drawOverlay = () => {
    if (started && !paused && !gameOver) return;
    ctx.fillStyle = 'rgba(251,255,251,.72)';
    ctx.fillRect(0, 0, width, height);
    const title = gameOver ? 'GAME OVER' : paused ? 'PAUSED' : 'READY';
    const subtitle = gameOver ? 'RESTART' : paused ? 'RESUME' : 'START';
    text(title, width / 2, 134, 31, colors.ink);
    text(subtitle, width / 2, 174, 14, colors.muted);
  };

  function render() {
    drawBackground();
    obstacles.forEach(drawObstacle);
    drawPlayer();
    text(formatScore(score), width - 42, 36, 16, colors.ink, 'right');
    drawOverlay();
  }

  const handleKeydown = (event) => {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'arrowup' || key === 'w') {
      event.preventDefault();
      jump();
    } else if (key === 'arrowdown' || key === 's') {
      event.preventDefault();
      drop();
    } else if (key === 'enter') {
      event.preventDefault();
      reset(true);
    } else if (key === 'p') {
      event.preventDefault();
      togglePause();
    }
  };
  const handlePointer = () => jump();
  const handleStart = () => jump();
  const handlePause = () => togglePause();

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', handlePointer);
  startButton?.addEventListener('click', handleStart);
  pauseButton?.addEventListener('click', handlePause);

  window.antiqueGameController = {
    destroy() {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', handlePointer);
      startButton?.removeEventListener('click', handleStart);
      pauseButton?.removeEventListener('click', handlePause);
    }
  };

  resizeCanvas();
  reset(false);
}

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
  writeBrowserStorage(window.sessionStorage, MUSIC_STATE_KEY, JSON.stringify({
    currentTime: audio.currentTime || 0,
    playing: !audio.paused && !audio.ended
  }));
};

const updateMusicUI = () => {
  musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  musicProgress.style.width = `${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%`;
};

const restoreMusicState = () => {
  const rawState = readBrowserStorage(window.sessionStorage, MUSIC_STATE_KEY);
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
  writeBrowserStorage(window.sessionStorage, MUSIC_STATE_KEY, JSON.stringify({
    currentTime: 0,
    playing: false
  }));
});

window.addEventListener('beforeunload', saveMusicState);

initializePage();
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
