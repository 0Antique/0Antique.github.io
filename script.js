const initializePage = () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
  initLanguageControls();
  applyLanguage(currentLanguage);
  loadProjects();
  initAntiqueGame();
  initHomeCarousel();
  updateMusicLanguage();
};

window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

let homeCarouselController = null;

function initHomeCarousel() {
  homeCarouselController?.destroy();
  homeCarouselController = null;

  const carousel = document.querySelector('.profile-image-wrap');
  const slides = Array.from(carousel?.querySelectorAll('.profile-slide') || []);
  if (!carousel || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let activeIndex = 0;
  let timer = 0;
  const showNext = () => {
    slides[activeIndex].classList.remove('is-active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('is-active');
  };
  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };
  const start = () => {
    stop();
    timer = window.setInterval(showNext, 4000);
  };

  carousel.addEventListener('pointerenter', stop);
  carousel.addEventListener('pointerleave', start);
  start();

  homeCarouselController = {
    destroy() {
      stop();
      carousel.removeEventListener('pointerenter', stop);
      carousel.removeEventListener('pointerleave', start);
    }
  };
}

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

const LANGUAGE_STORAGE_KEY = 'antique_site_language';
const translations = {
  en: {
    meta_home: "Antique's personal website: AI agents, federated learning, open-source projects, and life.",
    meta_profile: "Antique's profile, research interests, technical stack, and life beyond code.",
    meta_projects: "Antique's GitHub project portfolio.",
    meta_game: "Antique's pixel runner game: guide the smiling logo past the obstacles.",
    title_home: 'Yuanshuo Lin｜Home',
    title_profile: 'Yuanshuo Lin｜Profile',
    title_projects: 'Yuanshuo Lin｜Projects',
    title_game: 'Yuanshuo Lin｜Smile Runner',
    back_home: 'Back to home',
    main_nav: 'Main navigation',
    nav_home: 'Home',
    nav_profile: 'Profile',
    nav_projects: 'Projects',
    nav_game: 'Game',
    language_switch: 'Language',
    visitors: 'Visitors',
    visit_github: 'Visit GitHub',
    contact_links: 'Contact links',
    send_email: 'Send email',
    visit_bilibili: 'Visit my Bilibili profile',
    visit_xiaohongshu: 'Visit my Xiaohongshu profile',
    visit_csdn: 'Visit my CSDN profile',
    footer_quote: 'It was the best of times, it was the worst of times.',
    footer_projects: 'Build in public.',
    footer_game: 'Jump over deadlines.',
    home_heading: "Hello, <br> I'm <em>Antique</em>",
    home_intro: 'Master’s student in Computer Science<br><strong>AI Agent &amp; Federated Learning</strong>',
    home_note: 'AI will change the world, and I feel fortunate to be part of this era.',
    home_about_button: 'Get to Know Me <span>→</span>',
    home_projects_button: 'Browse Projects <span>→</span>',
    profile_scene: "Antique's profile photo",
    profile_photo: 'Photo of Antique',
    exploring_ai: 'AI Explorer',
    harbin_china: 'Harbin · China',
    peace_love: 'Peace &amp; Love',
    personal_info: 'Personal information',
    portrait_yuanshuo: 'Portrait of Yuanshuo Lin',
    profile_role: 'Third-year Master’s student',
    profile_school: 'Harbin Engineering University',
    email_label: 'Email',
    wechat_id: 'WeChat ID',
    profile_content: 'Profile content',
    about_index: '01 / ABOUT ME',
    about_heading: 'About Me',
    about_p1: 'I am a third-year Master student at <a href="https://www.hrbeu.edu.cn/" target="_blank" rel="noreferrer">Harbin Engineering University</a>, majoring in Artificial Intelligence &amp; Agent Development. I am advised by <a href="https://faculty.hrbeu.edu.cn/wangyong/zh_CN/index.htm" target="_blank" rel="noreferrer">Assoc. Prof. Yong Wang</a> from the <a class="highlight" href="https://heu-ai-lab.github.io/" target="_blank" rel="noreferrer">AI and Media Computing Team</a>.',
    about_p2: 'My research direction is <strong>AI Agent</strong> &amp; <strong>Federated Learning</strong>. AI will change the world, and I feel fortunate to be part of this era.',
    about_p3: "I'm an ESTJ. Outside of programming, I enjoy working out, running marathons and singing. A rich and varied life inspires more interesting work.",
    about_p4_intro: 'I am always looking to learn from others and exchange ideas. If any of this resonates with you, I’d greatly appreciate a chat via',
    about_p4_or: 'or',
    period: '.',
    research_index: '02 / RESEARCH INTERESTS',
    research_heading: 'Research Interests',
    interest_fl_title: 'Federated Learning',
    interest_fl_text: 'Heterogeneous &amp; privacy-preserving federated learning.',
    interest_agent_title: 'AI Agent',
    interest_agent_text: 'Agent systems, multi-agent collaboration, and intelligent workflow construction.',
    interest_apps_title: 'AI Applications',
    interest_apps_text: 'Turning interesting research ideas into useful systems with solid engineering practice.',
    publications_index: '03 / PUBLICATIONS',
    publications_heading: 'Publications',
    open_paper: 'Open FedCDKD paper PDF',
    publication_authors: '<strong>Yuanshuo Lin</strong> and Yong Wang',
    abstract_heading: 'Abstract',
    abstract_text: 'Federated visual recognition in practice often combines non-independent and identically distributed (non-IID) image streams, heterogeneous neural backbones, and intermittent client participation. FedCDKD uses aggregation conflict measured on the server to regulate local mutual distillation, delivering robust and stable gains across diverse data partitions, model heterogeneity levels, and participation ratios.',
    news_index: '04 / NEWS',
    news_heading: 'News',
    news_1: 'Another National Championship',
    news_2: 'Harbin Engineering University Cybersecurity Challenge Concludes Successfully',
    news_3: 'Graduate Entrance Examination Experience Sharing for Software Engineering Students',
    stack_index: '05 / TECHNICAL STACK',
    stack_heading: 'Technical Stack',
    development_heading: 'Development',
    development_skills: 'Development skills',
    ml_heading: 'Machine Learning',
    ml_skills: 'Machine learning skills',
    others_heading: 'Others',
    other_skills: 'Other skills',
    skill_agents: 'AI Agents',
    skill_fl: 'Federated Learning',
    projects_loading: 'Loading projects from GitHub…',
    project_no_description: 'No description is available for this project yet.',
    project_pinned: 'PINNED',
    project_fork: 'FORK',
    project_public: 'PUBLIC',
    project_stars: 'Stars',
    project_updated: 'Updated',
    projects_error: 'Projects could not be loaded. Please try again later or view them on <a href="https://github.com/0Antique?tab=repositories">GitHub</a>.',
    game_shell: 'Antique smile runner',
    game_heading: 'Smile Runner',
    game_canvas: 'Pixel-art Antique smile runner game',
    game_score: 'SCORE',
    game_best: 'BEST',
    game_start: 'Start',
    game_jump: 'Jump',
    game_restart: 'Restart',
    game_pause: 'Pause',
    game_resume: 'Resume',
    game_over: 'GAME OVER',
    game_paused: 'PAUSED',
    game_ready: 'READY',
    music_player: 'Music player',
    music_title: 'Sunset Boulevard',
    music_play: 'Play Sunset Boulevard',
    music_pause: 'Pause Sunset Boulevard',
    music_idle: 'Liang Bo · Click to play',
    music_playing: 'Liang Bo · Playing',
    music_paused: 'Liang Bo · Paused',
    music_ended: 'Liang Bo · Finished',
    music_blocked: 'Autoplay was blocked · Click the record to play',
    music_error: 'Playback failed · Please refresh and try again'
  },
  'zh-CN': {
    meta_home: 'Antique 的个人网站：AI 智能体、联邦学习、开源项目与生活。',
    meta_profile: 'Antique 的个人信息、研究方向、技术栈与生活兴趣。',
    meta_projects: 'Antique 的 GitHub 项目作品集。',
    meta_game: 'Antique 的像素跑酷小游戏：控制圆形笑脸 Logo 躲开障碍物。',
    title_home: '林远硕｜首页',
    title_profile: '林远硕｜个人简介',
    title_projects: '林远硕｜项目',
    title_game: '林远硕｜微笑跑酷',
    back_home: '返回首页',
    main_nav: '主导航',
    nav_home: '首页',
    nav_profile: '简介',
    nav_projects: '项目',
    nav_game: '游戏',
    language_switch: '语言切换',
    visitors: '访问量',
    visit_github: '访问 GitHub',
    contact_links: '联系方式',
    send_email: '发送邮件',
    visit_bilibili: '访问我的哔哩哔哩主页',
    visit_xiaohongshu: '访问我的小红书主页',
    visit_csdn: '访问我的 CSDN 主页',
    footer_quote: '这是最好的时代，也是最坏的时代。',
    footer_projects: '公开构建，持续分享。',
    footer_game: '跳过一个又一个截止日期。',
    home_heading: '你好，我是 <em>Antique</em>',
    home_intro: '计算机科学硕士研究生<br><strong>AI 智能体与联邦学习</strong>',
    home_note: 'AI 将改变世界，我很幸运能成为这个时代的一员。',
    home_about_button: '了解我 <span>→</span>',
    home_projects_button: '浏览项目 <span>→</span>',
    profile_scene: 'Antique 的个人照片',
    profile_photo: 'Antique 的照片',
    exploring_ai: 'AI Explorer',
    harbin_china: '中国 · 哈尔滨',
    peace_love: 'Peace & Love',
    personal_info: '个人信息',
    portrait_yuanshuo: '林远硕的证件照',
    profile_role: '硕士三年级研究生',
    profile_school: '哈尔滨工程大学',
    email_label: '邮箱',
    wechat_id: '微信号',
    profile_content: '个人简介内容',
    about_index: '01 / 关于我',
    about_heading: '关于我',
    about_p1: '我是<a href="https://www.hrbeu.edu.cn/" target="_blank" rel="noreferrer">哈尔滨工程大学</a>硕士三年级研究生，研究方向为人工智能与智能体开发，师从<a class="highlight" href="https://heu-ai-lab.github.io/" target="_blank" rel="noreferrer">人工智能与媒体计算团队</a>的<a href="https://faculty.hrbeu.edu.cn/wangyong/zh_CN/index.htm" target="_blank" rel="noreferrer">王勇副教授</a>。',
    about_p2: '我的研究方向是<strong>AI 智能体</strong>与<strong>联邦学习</strong>。AI 将改变世界，我很幸运能成为这个时代的一员。',
    about_p3: '我的 MBTI 是 ESTJ。编程之外，我喜欢健身、跑马拉松和唱歌。丰富多彩的生活能够激发更有趣的工作。',
    about_p4_intro: '我始终期待向他人学习并交流想法。如果这些内容与你产生共鸣，欢迎通过',
    about_p4_or: '或',
    period: '与我联系。',
    research_index: '02 / 研究方向',
    research_heading: '研究方向',
    interest_fl_title: '联邦学习',
    interest_fl_text: '异构联邦学习与隐私保护联邦学习。',
    interest_agent_title: 'AI 智能体',
    interest_agent_text: '智能体系统、多智能体协作与智能工作流构建。',
    interest_apps_title: 'AI 应用',
    interest_apps_text: '以扎实的工程实践，将有趣的研究想法转化为实用系统。',
    publications_index: '03 / 论文发表',
    publications_heading: '论文发表',
    open_paper: '打开 FedCDKD 论文 PDF',
    publication_authors: '<strong>林远硕</strong>、王勇',
    abstract_heading: '摘要',
    abstract_text: '实际的联邦视觉识别通常同时面临非独立同分布（non-IID）图像流、异构神经网络骨干以及客户端间歇参与等问题。FedCDKD 利用服务器端测得的聚合冲突来调节本地互蒸馏，在多种数据划分、模型异构程度和参与比例下均取得稳健且稳定的性能提升。',
    news_index: '04 / 新闻动态',
    news_heading: '新闻动态',
    news_1: '全国总冠军 +1',
    news_2: '【一院一节】哈尔滨工程大学网络安全挑战赛圆满落幕',
    news_3: '我院软件工程专业开展考研经验交流活动',
    stack_index: '05 / 技术栈',
    stack_heading: '技术栈',
    development_heading: '开发技术',
    development_skills: '开发技能',
    ml_heading: '机器学习',
    ml_skills: '机器学习技能',
    others_heading: '其他技能',
    other_skills: '其他技能',
    skill_agents: 'AI 智能体',
    skill_fl: '联邦学习',
    projects_loading: '正在从 GitHub 加载项目…',
    project_no_description: '这个项目暂时还没有简介。',
    project_pinned: '置顶',
    project_fork: '分支',
    project_public: '公开',
    project_stars: '星标数',
    project_updated: '更新于',
    projects_error: '项目暂时加载失败，请稍后重试或前往 <a href="https://github.com/0Antique?tab=repositories">GitHub</a> 查看。',
    game_shell: 'Antique 微笑跑酷',
    game_heading: '微笑跑酷',
    game_canvas: '像素风 Antique 圆形笑脸跑酷游戏',
    game_score: '得分',
    game_best: '最佳',
    game_start: '开始',
    game_jump: '跳跃',
    game_restart: '重新开始',
    game_pause: '暂停',
    game_resume: '继续',
    game_over: '游戏结束',
    game_paused: '已暂停',
    game_ready: '准备开始',
    music_player: '音乐播放器',
    music_title: '日落大道',
    music_play: '播放《日落大道》',
    music_pause: '暂停《日落大道》',
    music_idle: '梁博 · 点击播放',
    music_playing: '梁博 · 正在播放',
    music_paused: '梁博 · 已暂停',
    music_ended: '梁博 · 播放完毕',
    music_blocked: '浏览器已阻止自动播放 · 点击唱片播放',
    music_error: '播放失败 · 请刷新后重试'
  }
};

let currentLanguage = readBrowserStorage(window.localStorage, LANGUAGE_STORAGE_KEY) === 'zh-CN' ? 'zh-CN' : 'en';

const translate = (key) => translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;

function applyLanguage(language) {
  currentLanguage = language === 'zh-CN' ? 'zh-CN' : 'en';
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translate(element.dataset.i18n);
    if (value !== undefined) element.innerHTML = value;
  });

  const translatedAttributes = ['aria-label', 'title', 'alt', 'content'];
  translatedAttributes.forEach((attribute) => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
      const key = element.getAttribute(`data-i18n-${attribute}`);
      if (key) element.setAttribute(attribute, translate(key));
    });
  });

  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setLanguage(language) {
  const nextLanguage = language === 'zh-CN' ? 'zh-CN' : 'en';
  if (nextLanguage === currentLanguage) return;
  writeBrowserStorage(window.localStorage, LANGUAGE_STORAGE_KEY, nextLanguage);
  applyLanguage(nextLanguage);
  renderCurrentProjects();
  window.antiqueGameController?.refreshLanguage();
  updateMusicLanguage();
}

function initLanguageControls() {
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
}

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
    if (startButton) startButton.textContent = translate(gameOver ? 'game_restart' : started ? 'game_jump' : 'game_start');
    if (pauseButton) pauseButton.textContent = translate(paused ? 'game_resume' : 'game_pause');
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
    const title = translate(gameOver ? 'game_over' : paused ? 'game_paused' : 'game_ready');
    const subtitle = translate(gameOver ? 'game_restart' : paused ? 'game_resume' : 'game_start').toUpperCase();
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
    refreshLanguage() {
      updatePanel();
      render();
    },
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

let currentProjects = [];

function projectCard(repository) {
  const isPinned = pinnedProjects.includes(repository.name);
  const description = repository.description || translate('project_no_description');
  const language = repository.language ? `<span>${escapeHtml(repository.language)}</span>` : '';
  const label = translate(isPinned ? 'project_pinned' : repository.fork ? 'project_fork' : 'project_public');
  const dateLocale = currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US';
  return `
    <article class="project-card${isPinned ? ' is-pinned' : ''}">
      <div class="project-card-top">
        <span class="project-visibility">${label}</span>
        <span aria-label="${translate('project_stars')}">★ ${repository.stargazers_count}</span>
      </div>
      <h2><a href="${repository.html_url}" target="_blank" rel="noreferrer">${escapeHtml(repository.name)} ↗</a></h2>
      <p>${escapeHtml(description)}</p>
      <div class="project-meta">${language}<span>${translate('project_updated')} ${new Date(repository.updated_at).toLocaleDateString(dateLocale)}</span></div>
    </article>`;
}

function renderCurrentProjects() {
  const projectGrid = document.getElementById('project-grid');
  if (!projectGrid || !currentProjects.length) return;
  const repositories = [...currentProjects];
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
}

async function loadProjects() {
  const projectGrid = document.getElementById('project-grid');
  if (!projectGrid) return;
  const cachedProjects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const renderProjects = (repositories) => {
    currentProjects = repositories;
    renderCurrentProjects();
  };
  if (cachedProjects.length) renderProjects([...cachedProjects]);
  try {
    const response = await fetch('https://api.github.com/users/0Antique/repos?per_page=100&sort=updated');
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repositories = await response.json();
    renderProjects(repositories);
  } catch (error) {
    if (!cachedProjects.length) projectGrid.innerHTML = `<p class="project-state">${translate('projects_error')}</p>`;
  }
}

const MUSIC_STATE_KEY = 'antique_music_state';

const musicPlayer = document.createElement('aside');
musicPlayer.className = 'music-player';
musicPlayer.setAttribute('aria-label', '音乐播放器');

musicPlayer.innerHTML = `
  <button class="music-toggle" type="button" aria-label="播放日落大道" aria-pressed="false"><span class="music-record" aria-hidden="true"></span></button>
  <div class="music-info"><strong data-i18n="music_title">Sunset Boulevard</strong><span>Liang Bo · Click to play</span></div>
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
let musicStatus = 'idle';

function updateMusicLanguage() {
  if (!musicPlayer || !musicToggle || !musicLabel) return;
  musicPlayer.setAttribute('aria-label', translate('music_player'));
  musicToggle.setAttribute('aria-label', translate(audio.paused ? 'music_play' : 'music_pause'));
  musicLabel.textContent = translate(`music_${musicStatus}`);
  const title = musicPlayer.querySelector('[data-i18n="music_title"]');
  if (title) title.textContent = translate('music_title');
}

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
      musicStatus = 'blocked';
      updateMusicLanguage();
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
      musicStatus = 'error';
      updateMusicLanguage();
    }
  } else {
    audio.pause();
  }

  saveMusicState();
});

audio.addEventListener('play', () => {
  musicPlayer.classList.add('is-playing');
  musicToggle.setAttribute('aria-pressed', 'true');
  musicStatus = 'playing';
  updateMusicLanguage();
  saveMusicState();
});

audio.addEventListener('pause', () => {
  musicPlayer.classList.remove('is-playing');
  musicToggle.setAttribute('aria-pressed', 'false');
  musicStatus = audio.ended ? 'ended' : 'paused';
  updateMusicLanguage();
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
  const visitCount = document.getElementById('busuanzi_value_site_pv')?.textContent?.trim();
  document.documentElement.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'soft-navigation' } });
    if (!response.ok) throw new Error(`Page request failed: ${response.status}`);

    const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    if (requestId !== navigationRequest) return;

    const selectors = ['title', 'meta[name="description"]', '.ambient', '.site-header', 'main', 'footer'];
    for (const selector of selectors) {
      const currentElement = document.querySelector(selector);
      const nextElement = nextDocument.querySelector(selector);
      if (!currentElement || !nextElement) throw new Error(`Missing page element: ${selector}`);
      currentElement.replaceWith(document.importNode(nextElement, true));
    }

    if (visitCount && visitCount !== '—') {
      const nextVisitCount = document.getElementById('busuanzi_value_site_pv');
      if (nextVisitCount) nextVisitCount.textContent = visitCount;
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
