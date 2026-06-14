const pages = {
  home: document.getElementById('homePage'),
  transition: document.getElementById('transitionPage'),
  story: document.getElementById('storyPage'),
  kuon: document.getElementById('kuonPage'),
  lore: document.getElementById('lorePage'),
  roadmap: document.getElementById('roadmapPage'),
  relics: document.getElementById('relicsPage'),
  eternalKey: document.getElementById('eternalKeyPage'),
};
const homeAudio = document.getElementById('homeAudio');
const storyAudio = document.getElementById('storyAudio');
const relicsAudio = document.getElementById('relicsAudio');
const eternalKeyAudio = document.getElementById('eternalKeyAudio');
const homeSoundToggle = document.getElementById('homeSoundToggle');
const storySoundToggle = document.getElementById('storySoundToggle');
const relicsSoundToggle = document.getElementById('relicsSoundToggle');
const kuonSoundToggle = document.getElementById('kuonSoundToggle');
const loreSoundToggle = document.getElementById('loreSoundToggle');
const roadmapSoundToggle = document.getElementById('roadmapSoundToggle');
const loreNarration = document.getElementById('loreNarration');
const loreNarrationBtn = document.getElementById('loreNarrationBtn');
const eternalKeySoundToggle = document.getElementById('eternalKeySoundToggle');
const portal = document.getElementById('kuonStoryPortal');
const relicsPortal = document.getElementById('theRelicsPortal');
const transitionVideo = document.getElementById('transitionVideo');
const relicTransitionVideo = document.getElementById('relicTransitionVideo');
const hoverImg = document.getElementById('hoverImg');
const menuPanel = document.getElementById('menuPanel');
const homeMenuPanel = null;
const relicsMenuPanel = document.getElementById('relicsMenuPanel');
const kuonMenuPanel = document.getElementById('kuonMenuPanel');
const loreMenuPanel = document.getElementById('loreMenuPanel');
const roadmapMenuPanel = document.getElementById('roadmapMenuPanel');
const eternalKeyMenuPanel = document.getElementById('eternalKeyMenuPanel');
const scrollWrap = document.getElementById('scrollWrap');

const hoverSources = Array.from(document.querySelectorAll('.panel-zone')).map(btn => btn.dataset.hover);
hoverSources.forEach(src => { const img = new Image(); img.src = src; });
transitionVideo.load();
relicTransitionVideo.load();

let homeSoundOn = true;
let storySoundOn = true;
let relicsSoundOn = true;
let eternalKeySoundOn = true;
let transitioning = false;
let hoverTimer = null;
let loreNarrationWasStorySoundOn = false;

function tryPlay(audio) {
  if (!audio) return;
  const p = audio.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}
function fadeAudio(audio, target, duration = 650, onDone) {
  if (!audio) return;
  const start = audio.volume;
  const startTime = performance.now();
  if (target > 0) tryPlay(audio);
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    audio.volume = start + (target - start) * t;
    if (t < 1) requestAnimationFrame(tick);
    else {
      audio.volume = target;
      if (target === 0) audio.pause();
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(tick);
}
function isLoreNarrationPlaying() {
  return loreNarration && !loreNarration.paused && !loreNarration.ended;
}
function getCurrentLanguage() {
  return localStorage.getItem('kuonLanguage') || document.documentElement.dataset.kuonLang || 'en';
}
function getLoreNarrationSrc(lang = getCurrentLanguage()) {
  return lang === 'jp' ? 'assets/lore/lore-audio-ja.mp3' : 'assets/lore/lore-audio.mp3';
}
function updateLoreNarrationSource(keepTime = false) {
  if (!loreNarration) return;
  const nextSrc = getLoreNarrationSrc();
  const currentSrc = loreNarration.getAttribute('src') || '';
  if (currentSrc === nextSrc) return;

  const wasPlaying = isLoreNarrationPlaying();
  const currentTime = keepTime ? loreNarration.currentTime : 0;
  loreNarration.pause();
  loreNarration.setAttribute('src', nextSrc);
  loreNarration.load();
  loreNarration.currentTime = currentTime;
  if (wasPlaying) tryPlay(loreNarration);
}
function setLoreNarrationButton(state) {
  if (!loreNarrationBtn) return;
  const isJp = getCurrentLanguage() === 'jp';
  if (state === 'pause') loreNarrationBtn.textContent = isJp ? '⏸ 物語を一時停止' : '⏸ Pause Narration';
  else if (state === 'replay') loreNarrationBtn.textContent = isJp ? '↺ 物語をもう一度聞く' : '↺ Replay Story';
  else loreNarrationBtn.textContent = isJp ? '▶ 物語を聞く' : '▶ Listen to the Story';
}
function stopLoreNarration(reset = true) {
  if (!loreNarration) return;
  loreNarration.pause();
  if (reset) loreNarration.currentTime = 0;
  setLoreNarrationButton('play');
}
function restoreStoryAudioAfterNarration() {
  if (pages.lore.classList.contains('active') && loreNarrationWasStorySoundOn && storySoundOn) {
    storyAudio.volume = .86;
    tryPlay(storyAudio);
  }
}
function showPage(name) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[name].classList.add('active');
  document.body.classList.toggle('story-active', name === 'story');
  document.body.classList.toggle('kuon-active', name === 'kuon');
  document.body.classList.toggle('lore-active', name === 'lore');
  document.body.classList.toggle('roadmap-active', name === 'roadmap');
  document.body.classList.toggle('relics-active', name === 'relics');
  document.body.classList.toggle('eternal-key-active', name === 'eternalKey');

  if (name !== 'lore') stopLoreNarration();

  if (homeMenuPanel && name !== 'home') homeMenuPanel.classList.remove('open');
  if (menuPanel && name !== 'story') menuPanel.classList.remove('open');
  if (kuonMenuPanel && name !== 'kuon') kuonMenuPanel.classList.remove('open');
  if (loreMenuPanel && name !== 'lore') loreMenuPanel.classList.remove('open');
  if (roadmapMenuPanel && name !== 'roadmap') roadmapMenuPanel.classList.remove('open');
  if (relicsMenuPanel && name !== 'relics') relicsMenuPanel.classList.remove('open');
  if (eternalKeyMenuPanel && name !== 'eternalKey') eternalKeyMenuPanel.classList.remove('open');
}
function updateToggles() {
  homeSoundToggle.textContent = homeSoundOn ? 'SOUND ON' : 'SOUND OFF';
  storySoundToggle.textContent = storySoundOn ? 'SOUND ON' : 'SOUND OFF';
  relicsSoundToggle.textContent = relicsSoundOn ? 'SOUND ON' : 'SOUND OFF';
  if (kuonSoundToggle) kuonSoundToggle.textContent = storySoundOn ? 'SOUND ON' : 'SOUND OFF';
  if (loreSoundToggle) loreSoundToggle.textContent = storySoundOn ? 'SOUND ON' : 'SOUND OFF';
  if (roadmapSoundToggle) roadmapSoundToggle.textContent = storySoundOn ? 'SOUND ON' : 'SOUND OFF';
  if (eternalKeySoundToggle) eternalKeySoundToggle.textContent = eternalKeySoundOn ? 'SOUND ON' : 'SOUND OFF';
}
function startHomeAudio() {
  stopLoreNarration();
  storyAudio.pause();
  relicsAudio.pause();
  if (eternalKeyAudio) eternalKeyAudio.pause();
  if (homeSoundOn) { homeAudio.volume = .9; tryPlay(homeAudio); }
}
function startStoryAudio() {
  homeAudio.pause();
  relicsAudio.pause();
  if (eternalKeyAudio) eternalKeyAudio.pause();
  if (!pages.lore.classList.contains('active')) stopLoreNarration();
  if (storySoundOn && !isLoreNarrationPlaying()) { storyAudio.volume = .86; tryPlay(storyAudio); }
}
function startRelicsAudio() {
  stopLoreNarration();
  homeAudio.pause();
  storyAudio.pause();
  if (eternalKeyAudio) eternalKeyAudio.pause();
  if (relicsSoundOn) { relicsAudio.volume = .86; tryPlay(relicsAudio); }
}
function startEternalKeyAudio() {
  stopLoreNarration();
  homeAudio.pause();
  storyAudio.pause();
  relicsAudio.pause();
  if (eternalKeySoundOn && eternalKeyAudio) { eternalKeyAudio.volume = .86; tryPlay(eternalKeyAudio); }
}

window.addEventListener('load', () => {
  homeAudio.volume = .9;
  storyAudio.volume = .86;
  relicsAudio.volume = .86;
  if (eternalKeyAudio) eternalKeyAudio.volume = .86;
  startHomeAudio();
  updateToggles();
});
window.addEventListener('pointerdown', () => {
  if (pages.home.classList.contains('active') && homeSoundOn && homeAudio.paused) startHomeAudio();
  if (pages.story.classList.contains('active') && storySoundOn && storyAudio.paused) startStoryAudio();
  if (pages.kuon.classList.contains('active') && storySoundOn && storyAudio.paused) startStoryAudio();
  if (pages.lore.classList.contains('active') && storySoundOn && storyAudio.paused && !isLoreNarrationPlaying()) startStoryAudio();
  if (pages.roadmap.classList.contains('active') && storySoundOn && storyAudio.paused) startStoryAudio();
  if (pages.relics.classList.contains('active') && relicsSoundOn && relicsAudio.paused) startRelicsAudio();
  if (pages.eternalKey.classList.contains('active') && eternalKeySoundOn && eternalKeyAudio && eternalKeyAudio.paused) startEternalKeyAudio();
}, { once: false });

homeSoundToggle.addEventListener('click', () => {
  homeSoundOn = !homeSoundOn;
  if (homeSoundOn) startHomeAudio(); else fadeAudio(homeAudio, 0, 300);
  updateToggles();
});
storySoundToggle.addEventListener('click', () => {
  storySoundOn = !storySoundOn;
  if (storySoundOn) startStoryAudio(); else fadeAudio(storyAudio, 0, 300);
  updateToggles();
});
relicsSoundToggle.addEventListener('click', () => {
  relicsSoundOn = !relicsSoundOn;
  if (relicsSoundOn) startRelicsAudio(); else fadeAudio(relicsAudio, 0, 300);
  updateToggles();
});
if (kuonSoundToggle) {
  kuonSoundToggle.addEventListener('click', () => {
    storySoundOn = !storySoundOn;
    if (storySoundOn) startStoryAudio(); else fadeAudio(storyAudio, 0, 300);
    updateToggles();
  });
}
if (loreSoundToggle) {
  loreSoundToggle.addEventListener('click', () => {
    storySoundOn = !storySoundOn;
    if (storySoundOn && !isLoreNarrationPlaying()) startStoryAudio(); else fadeAudio(storyAudio, 0, 300);
    updateToggles();
  });
}
if (roadmapSoundToggle) {
  roadmapSoundToggle.addEventListener('click', () => {
    storySoundOn = !storySoundOn;
    if (storySoundOn) startStoryAudio(); else fadeAudio(storyAudio, 0, 300);
    updateToggles();
  });
}
if (loreNarrationBtn && loreNarration) {
  loreNarrationBtn.addEventListener('click', () => {
    if (!pages.lore.classList.contains('active')) return;

    if (isLoreNarrationPlaying()) {
      loreNarration.pause();
      setLoreNarrationButton('play');
      restoreStoryAudioAfterNarration();
      return;
    }

    updateLoreNarrationSource(false);
    loreNarrationWasStorySoundOn = storySoundOn && !storyAudio.paused;
    if (loreNarrationWasStorySoundOn) fadeAudio(storyAudio, 0, 250);
    loreNarration.volume = 1;
    if (loreNarration.ended) loreNarration.currentTime = 0;
    tryPlay(loreNarration);
    setLoreNarrationButton('pause');
  });

  loreNarration.addEventListener('ended', () => {
    setLoreNarrationButton('replay');
    restoreStoryAudioAfterNarration();
  });
}
if (eternalKeySoundToggle) {
  eternalKeySoundToggle.addEventListener('click', () => {
    eternalKeySoundOn = !eternalKeySoundOn;
    if (eternalKeySoundOn) startEternalKeyAudio(); else fadeAudio(eternalKeyAudio, 0, 300);
    updateToggles();
  });
}

async function enterKuonStory() {
  if (transitioning) return;
  transitioning = true;
  fadeAudio(homeAudio, 0, 450);
  showPage('transition');
  transitionVideo.currentTime = 0;
  transitionVideo.classList.add('show');
  tryPlay(transitionVideo);
  await new Promise(resolve => {
    const fallback = setTimeout(resolve, 3600);
    transitionVideo.onended = () => {
      clearTimeout(fallback);
      resolve();
    };
  });
  transitionVideo.pause();
  transitionVideo.classList.remove('show');
  hoverImg.classList.remove('active');
  showPage('story');
  scrollWrap.style.animation = 'none';
  void scrollWrap.offsetWidth;
  scrollWrap.style.animation = '';
  startStoryAudio();
  transitioning = false;
}

async function playTransitionAndShow(video, targetPage, startAudio) {
  if (transitioning) return;
  transitioning = true;
  fadeAudio(homeAudio, 0, 450);
  fadeAudio(storyAudio, 0, 250);
  fadeAudio(relicsAudio, 0, 250);
  fadeAudio(eternalKeyAudio, 0, 250);
  showPage('transition');
  transitionVideo.pause();
  transitionVideo.classList.remove('show');
  relicTransitionVideo.pause();
  relicTransitionVideo.classList.remove('show');
  video.currentTime = 0;
  video.classList.add('show');
  tryPlay(video);
  await new Promise(resolve => {
    const fallback = setTimeout(resolve, 4200);
    video.onended = () => {
      clearTimeout(fallback);
      resolve();
    };
  });
  video.pause();
  video.classList.remove('show');
  showPage(targetPage);
  startAudio();
  transitioning = false;
}
async function enterTheRelics() {
  await playTransitionAndShow(relicTransitionVideo, 'relics', startRelicsAudio);
}

portal.addEventListener('click', enterKuonStory);
relicsPortal.addEventListener('click', enterTheRelics);

function goHome() {
  closeAllMenus();
  fadeAudio(storyAudio, 0, 350);
  fadeAudio(relicsAudio, 0, 350);
  fadeAudio(eternalKeyAudio, 0, 350);
  showPage('home');
  startHomeAudio();
}
document.getElementById('backBtn').addEventListener('click', goHome);
document.getElementById('relicsBackBtn').addEventListener('click', goHome);
document.getElementById('kuonBackBtn').addEventListener('click', () => { closeAllMenus(); showPage('story'); startStoryAudio(); });
document.getElementById('loreBackBtn').addEventListener('click', () => { closeAllMenus(); showPage('story'); startStoryAudio(); });
const roadmapBackBtn = document.getElementById('roadmapBackBtn');
if (roadmapBackBtn) roadmapBackBtn.addEventListener('click', () => { closeAllMenus(); showPage('story'); startStoryAudio(); });
document.getElementById('eternalKeyBackBtn').addEventListener('click', () => { closeAllMenus(); fadeAudio(eternalKeyAudio, 0, 250); showPage('relics'); startRelicsAudio(); });

function closeAllMenus() {
  if (homeMenuPanel) homeMenuPanel.classList.remove('open');
  if (menuPanel) menuPanel.classList.remove('open');
  if (kuonMenuPanel) kuonMenuPanel.classList.remove('open');
  if (loreMenuPanel) loreMenuPanel.classList.remove('open');
  if (roadmapMenuPanel) roadmapMenuPanel.classList.remove('open');
  if (relicsMenuPanel) relicsMenuPanel.classList.remove('open');
  if (eternalKeyMenuPanel) eternalKeyMenuPanel.classList.remove('open');
}

function toggleMenu(panel) {
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  closeAllMenus();
  panel.classList.toggle('open', !isOpen);
}

document.getElementById('menuBtn').addEventListener('click', () => toggleMenu(menuPanel));
document.getElementById('relicsMenuBtn').addEventListener('click', () => toggleMenu(relicsMenuPanel));
document.getElementById('kuonMenuBtn').addEventListener('click', () => toggleMenu(kuonMenuPanel));
document.getElementById('loreMenuBtn').addEventListener('click', () => toggleMenu(loreMenuPanel));
const roadmapMenuBtn = document.getElementById('roadmapMenuBtn');
if (roadmapMenuBtn) roadmapMenuBtn.addEventListener('click', () => toggleMenu(roadmapMenuPanel));
document.getElementById('eternalKeyMenuBtn').addEventListener('click', () => toggleMenu(eternalKeyMenuPanel));


function goKuonPage() {
  closeAllMenus();
  fadeAudio(homeAudio, 0, 250);
  fadeAudio(relicsAudio, 0, 250);
  fadeAudio(eternalKeyAudio, 0, 250);
  showPage('kuon');
  startStoryAudio();
}

function goLorePage() {
  closeAllMenus();
  fadeAudio(homeAudio, 0, 250);
  fadeAudio(relicsAudio, 0, 250);
  fadeAudio(eternalKeyAudio, 0, 250);
  showPage('lore');
  startStoryAudio();
}

function goRoadmapPage() {
  closeAllMenus();
  fadeAudio(homeAudio, 0, 250);
  fadeAudio(relicsAudio, 0, 250);
  fadeAudio(eternalKeyAudio, 0, 250);
  showPage('roadmap');
  startStoryAudio();
}

function goEternalKeyPage() {
  closeAllMenus();
  closeSealedModal();
  fadeAudio(homeAudio, 0, 250);
  fadeAudio(storyAudio, 0, 250);
  fadeAudio(relicsAudio, 0, 250);
  showPage('eternalKey');
  startEternalKeyAudio();
}

async function goKuonStoryFromMenu() {
  closeAllMenus();
  await playTransitionAndShow(transitionVideo, 'story', startStoryAudio);
}

async function goRelicsFromMenu() {
  closeAllMenus();
  await playTransitionAndShow(relicTransitionVideo, 'relics', startRelicsAudio);
}

function handleMenuTarget(target) {
  if (!target) return;
  if (target === 'home') return goHome();
  if (target === 'kuon') return goKuonPage();
  if (target === 'lore') return goLorePage();
  if (target === 'roadmap') return goRoadmapPage();
  if (target === 'story') return goKuonStoryFromMenu();
  if (target === 'relics') return goRelicsFromMenu();
  if (target === 'eternal-key') return goEternalKeyPage();
  if (sealedTargets.has(target)) return openSealedModal();
  if (target === 'sound') {
    homeSoundOn = !homeSoundOn;
    if (homeSoundOn) startHomeAudio(); else fadeAudio(homeAudio, 0, 300);
    updateToggles();
    return;
  }
  if (target === 'credits-terms') {
    closeAllMenus();
    const privacyModal = document.getElementById('privacyModal');
    if (privacyModal) privacyModal.classList.add('open');
    return;
  }
  closeAllMenus();
}

[homeMenuPanel, menuPanel, kuonMenuPanel, loreMenuPanel, roadmapMenuPanel, relicsMenuPanel, eternalKeyMenuPanel].forEach((panel) => {
  if (!panel) return;
  panel.addEventListener('click', (e) => handleMenuTarget(e.target.dataset.target));
});

for (const btn of document.querySelectorAll('.panel-zone')) {
  const activate = () => {
    clearTimeout(hoverTimer);
    if (hoverImg.src.endsWith(btn.dataset.hover)) {
      hoverImg.classList.add('active');
      return;
    }
    hoverImg.classList.remove('active');
    hoverTimer = setTimeout(() => {
      hoverImg.src = btn.dataset.hover;
      requestAnimationFrame(() => hoverImg.classList.add('active'));
    }, 35);
  };
  const deactivate = () => {
    clearTimeout(hoverTimer);
    hoverImg.classList.remove('active');
  };
  btn.addEventListener('mouseenter', activate);
  btn.addEventListener('focus', activate);
  btn.addEventListener('mouseleave', deactivate);
  btn.addEventListener('blur', deactivate);
  btn.addEventListener('click', () => {
    if (btn.dataset.label === 'KUON') goKuonPage();
    if (btn.dataset.label === 'LORE') goLorePage();
    if (btn.dataset.label === 'ROADMAP') goRoadmapPage();
  });
}

document.getElementById('termsOpen').addEventListener('click', () => { document.getElementById('privacyModal').classList.remove('open'); document.getElementById('termsModal').classList.add('open'); });
document.getElementById('termsClose').addEventListener('click', () => document.getElementById('termsModal').classList.remove('open'));
document.getElementById('termsModal').addEventListener('click', e => { if (e.target.id === 'termsModal') e.currentTarget.classList.remove('open'); });

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'd') document.body.classList.toggle('debug');
  if (e.key === 'Escape') {
    document.getElementById('termsModal').classList.remove('open');
    closePrivacyModal();
    closeSealedModal();
    closeAllMenus();
  }
});

const privacyOpen = document.getElementById('privacyOpen');
const privacyClose = document.getElementById('privacyClose');
const privacyModal = document.getElementById('privacyModal');

function openPrivacyModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) termsModal.classList.remove('open');
  if (privacyModal) privacyModal.classList.add('open');
}

function closePrivacyModal() {
  if (privacyModal) privacyModal.classList.remove('open');
}

if (privacyOpen) privacyOpen.addEventListener('click', openPrivacyModal);
if (privacyClose) privacyClose.addEventListener('click', closePrivacyModal);
if (privacyModal) privacyModal.addEventListener('click', e => { if (e.target.id === 'privacyModal') closePrivacyModal(); });


const sealedModal = document.getElementById('sealedModal');
const sealedClose = document.getElementById('sealedClose');
const sealedTargets = new Set(['travelers', 'dreambeasts', 'wallet-checker']);

function openSealedModal() {
  closeAllMenus();
  if (sealedModal) sealedModal.classList.add('open');
}

function closeSealedModal() {
  if (sealedModal) sealedModal.classList.remove('open');
}

for (const btn of document.querySelectorAll('.relics-sealed-zone')) {
  if (btn.classList.contains('sealed-eternal-key')) {
    btn.addEventListener('click', goEternalKeyPage);
  } else {
    btn.addEventListener('click', openSealedModal);
  }
}

if (sealedClose) sealedClose.addEventListener('click', closeSealedModal);
if (sealedModal) sealedModal.addEventListener('click', e => { if (e.target.id === 'sealedModal') closeSealedModal(); });



(function() {
  const translations = {
    en: {
      home: 'HOME',
      kuonStory: 'KUON STORY',
      theRelics: 'THE RELICS',
      sound: 'SOUND',
      creditsTerms: 'CREDITS / TERMS',
      kuon: 'KUON',
      lore: 'LORE',
      roadmap: 'ROADMAP',
      archive: 'ARCHIVE',
      eternalKey: 'ETERNAL KEY',
      travelers: 'DREAMWALKERS',
      dreambeasts: 'DREAMBEASTS',
      walletChecker: 'WALLET CHECKER',
      termsLink: 'Terms of Service',
      privacyLink: 'Privacy & Credits',
      close: 'CLOSE',
      listenStory: '▶ Listen to the Story',
      termsContent: `<h1>KUON NFT WEBSITE TERMS OF SERVICE</h1>\n\n      <h2>1. Acceptance of Terms</h2>\n      <p>By accessing kuonnft.xyz and any services related to KUON, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the website and related services.</p>\n\n      <h2>2. User Eligibility</h2>\n      <p>Users must be at least 18 years old or the legal age of majority in their jurisdiction.</p>\n      <p>By using KUON, you represent and warrant that your participation complies with all applicable laws and regulations.</p>\n\n      <h2>3. NFT Purchase</h2>\n      <p>KUON NFTs are digital collectibles recorded on the blockchain through smart contracts.</p>\n      <p>All blockchain transactions are final and irreversible. KUON cannot reverse, cancel, or recover completed transactions.</p>\n      <p>Users are responsible for using a supported third-party wallet to purchase, hold, and transfer NFTs.</p>\n      <p>Users are solely responsible for the security of their wallets, private keys, seed phrases, passwords, and digital assets.</p>\n      <p>KUON is not responsible for any loss resulting from unauthorized access, phishing attacks, compromised wallets, lost credentials, or user error.</p>\n\n      <h2>4. NFT Ownership</h2>\n      <p>Ownership of a KUON NFT grants ownership of the NFT recorded on the blockchain but does not transfer ownership of KUON intellectual property, trademarks, artwork, branding, lore, or other project assets unless expressly stated otherwise.</p>\n      <p>Ownership is verified by the wallet holding the NFT on the blockchain.</p>\n\n      <h2>5. Intellectual Property</h2>\n      <p>All KUON artwork, logos, designs, lore, website content, branding, and related materials remain the exclusive property of KUON.</p>\n      <p>All rights not expressly granted are reserved.</p>\n\n      <h2>6. Privacy</h2>\n      <p>KUON may collect limited information necessary for website functionality, analytics, security, and community operations.</p>\n      <p>By using the website, you consent to the collection and processing of such information.</p>\n      <p>KUON does not request or store users' private keys, seed phrases, or wallet passwords.</p>\n\n      <h2>7. Disclaimer</h2>\n      <p>KUON NFTs are digital collectibles intended for artistic, entertainment, and community purposes only.</p>\n      <p>KUON NFTs are not securities, investment products, or financial instruments.</p>\n      <p>KUON makes no guarantees regarding future value, rarity, utility, market demand, or future project development.</p>\n      <p>NFT values may increase, decrease, or become worthless.</p>\n      <p>Participation in KUON is entirely at your own risk.</p>\n\n      <h2>8. Limitation of Liability</h2>\n      <p>Users acknowledge that blockchain technology involves inherent risks, including but not limited to smart contract vulnerabilities, network failures, digital asset volatility, and third-party service failures.</p>\n      <p>KUON shall not be liable for:</p>\n      <ul>\n        <li>Blockchain failures</li>\n        <li>Wallet compromises</li>\n        <li>Smart contract vulnerabilities</li>\n        <li>NFT price fluctuations</li>\n        <li>Marketplace issues</li>\n        <li>Technical interruptions</li>\n        <li>Loss of digital assets</li>\n      </ul>\n      <p>All services are provided on an "AS IS" and "AS AVAILABLE" basis.</p>\n\n      <h2>9. Applicable Law</h2>\n      <p>Any disputes arising from these Terms shall first be resolved through good-faith negotiation.</p>\n      <p>If a resolution cannot be reached, disputes may be submitted to arbitration or another appropriate legal process as permitted by applicable law.</p>\n\n      <h2>10. Contact</h2>\n      <p>Website: kuonnft.xyz</p>\n      <p>X (Twitter): <a href="https://x.com/KUONNFT" target="_blank" rel="noopener noreferrer">@KUONNFT</a></p>\n      <p>Discord: 久遠 | KUON</p>\n\n      <p class="signature">Thank you for visiting KUON.<br /><br />© 2026 KUON. All Rights Reserved.</p>`,
      privacyContent: `<h1>PRIVACY &amp; CREDITS</h1>

<h2>Privacy</h2>
<p>KUON may collect limited information necessary for website functionality, analytics, security, and wallet-related interactions.</p>
<p>This information may include:</p>
<ul>
  <li>Browser information</li>
  <li>Device information</li>
  <li>Wallet addresses</li>
  <li>Website usage analytics</li>
</ul>
<p>KUON does not request, store, or have access to users' private keys, seed phrases, or wallet passwords.</p>
<p>KUON does not sell personal information to third parties.</p>
<p>By using kuonnft.xyz, you consent to the collection and processing of such information.</p>
<hr>
<h2>Third-Party Services</h2>
<p>KUON may utilize third-party services including wallet providers, analytics providers, hosting services, social media platforms, and content providers.</p>
<p>These services operate under their own terms and privacy policies.</p>
<hr>
<h2>Data Security</h2>
<p>KUON takes reasonable measures to help protect website functionality and user interactions. However, no method of electronic transmission or storage is completely secure, and KUON cannot guarantee absolute security.</p>
<hr>
<h2>Disclaimer</h2>
<p>KUON is a digital art and storytelling project.</p>
<p>Nothing contained on this website constitutes financial advice, investment advice, legal advice, or any other form of professional advice.</p>
<p>KUON NFTs are intended for artistic, entertainment, and community purposes only.</p>
<p>Users are solely responsible for conducting their own research and making their own decisions regarding digital assets, blockchain technologies, and related activities.</p>
<hr>
<h2>Wallet Disclaimer</h2>
<p>Users are responsible for maintaining the security of their wallets, private keys, seed phrases, passwords, devices, and internet connections.</p>
<p>KUON cannot recover lost wallets, private keys, seed phrases, passwords, digital assets, or blockchain transactions.</p>
<p>All blockchain transactions are final and irreversible.</p>
<hr>
<h2>Intellectual Property</h2>
<p>All original KUON artwork, visual designs, logos, branding elements, story content, written materials, website content, and related assets are protected by applicable intellectual property laws unless otherwise stated.</p>
<p>Third-party content remains the property of its respective owners and is used under applicable licenses.</p>
<hr>
<h2>Limitation of Liability</h2>
<p>KUON, its creators, contributors, affiliates, and service providers shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising from the use of this website.</p>
<p>This includes, but is not limited to:</p>
<ul>
  <li>Loss of digital assets</li>
  <li>Wallet compromise</li>
  <li>Service interruptions</li>
  <li>Website downtime</li>
  <li>Technical failures</li>
  <li>Third-party platform issues</li>
  <li>Blockchain network issues</li>
</ul>
<p>All services are provided on an "AS IS" and "AS AVAILABLE" basis.</p>
<hr>
<h2>Changes</h2>
<p>KUON reserves the right to modify, update, revise, or replace this Privacy &amp; Credits page at any time without prior notice.</p>
<p>Any changes will be reflected on this page with an updated revision date.</p>
<p>Continued use of the website following any modifications constitutes acceptance of the updated policy.</p>
<hr>
<h2>Music Credits</h2>
<p>The following music is used under their respective Creative Commons licenses.</p>
<h3>Ronin</h3>
<p>Ronin by yoitrax<br>https://soundcloud.com/yoitrax</p>
<p>Music promoted on https://www.chosic.com/free-music/all/</p>
<p>Creative Commons Attribution 3.0 Unported (CC BY 3.0)<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>Samurai Saké Showdown</h3>
<p>Samurai Saké Showdown by Darren Curtis<br>https://www.darrencurtismusic.com/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 3.0<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>Konnichiwa</h3>
<p>Konnichiwa by Alex-Productions<br>https://onsound.eu/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 3.0<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>EpicBattle J</h3>
<p>EpicBattle J by PeriTune<br>https://peritune.com/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 4.0<br>https://creativecommons.org/licenses/by/4.0/</p>
<hr>
<p>All music remains the property of its respective creators and is used in accordance with the terms of their respective Creative Commons licenses.</p>
<hr>
<h2>Contact</h2>
<p>Website: kuonnft.xyz</p>
<p>X (Twitter): @KUONNFT</p>
<p>Discord: 久遠 | KUON</p>
<p>© 2026 KUON. All Rights Reserved.</p>`
    },
    jp: {
      home: 'ホーム',
      kuonStory: '久遠物語',
      theRelics: '遺物',
      sound: '音',
      creditsTerms: 'クレジット・規約',
      kuon: '久遠',
      lore: '伝承',
      roadmap: 'ロードマップ',
      archive: '記録',
      eternalKey: '永遠の鍵',
      travelers: '夢歩き人',
      dreambeasts: '夢獣',
      walletChecker: 'ウォレット確認',
      termsLink: '利用規約',
      privacyLink: 'プライバシー・クレジット',
      close: '閉じる',
      listenStory: '▶ 物語を聞く',
      termsContent: `<h1>KUON NFT ウェブサイト利用規約</h1>\n\n      <h2>1. 規約への同意</h2>\n      <p>kuonnft.xyz および KUON に関連するサービスへアクセスすることにより、本利用規約に同意したものとみなされます。同意しない場合は、ウェブサイトおよび関連サービスの利用を中止してください。</p>\n\n      <h2>2. 利用資格</h2>\n      <p>ユーザーは18歳以上、または居住地域における成人年齢に達している必要があります。</p>\n      <p>KUON を利用することにより、ユーザーは自身の参加が適用される法律および規制を遵守していることを表明し保証します。</p>\n\n      <h2>3. NFTの購入</h2>\n      <p>KUON NFT は、スマートコントラクトを通じてブロックチェーン上に記録されるデジタルコレクティブルです。</p>\n      <p>すべてのブロックチェーン取引は最終的かつ取消不能です。KUON は完了した取引を取り消し、キャンセルし、または復元することはできません。</p>\n      <p>ユーザーは、NFT の購入、保有、送信に対応する第三者ウォレットを使用する責任を負います。</p>\n      <p>ユーザーは、自身のウォレット、秘密鍵、シードフレーズ、パスワード、デジタル資産の管理について単独で責任を負います。</p>\n      <p>KUON は、不正アクセス、フィッシング、ウォレットの侵害、認証情報の紛失、またはユーザーの過失による損失について責任を負いません。</p>\n\n      <h2>4. NFTの所有権</h2>\n      <p>KUON NFT の所有は、ブロックチェーン上に記録された NFT の所有を意味します。ただし、別途明示されない限り、KUON の知的財産、商標、アートワーク、ブランド、伝承、その他プロジェクト資産の所有権を譲渡するものではありません。</p>\n      <p>所有権は、該当 NFT を保有するウォレットによって確認されます。</p>\n\n      <h2>5. 知的財産</h2>\n      <p>KUON のアートワーク、ロゴ、デザイン、伝承、ウェブサイトコンテンツ、ブランド、および関連素材は、KUON の独占的な財産です。</p>\n      <p>明示的に許諾されていないすべての権利は留保されます。</p>\n\n      <h2>6. プライバシー</h2>\n      <p>KUON は、ウェブサイト機能、分析、セキュリティ、コミュニティ運営に必要な限定的な情報を収集する場合があります。</p>\n      <p>ウェブサイトを利用することにより、ユーザーは当該情報の収集および処理に同意したものとみなされます。</p>\n      <p>KUON は、ユーザーの秘密鍵、シードフレーズ、ウォレットパスワードを要求または保存しません。</p>\n\n      <h2>7. 免責事項</h2>\n      <p>KUON NFT は、芸術、エンターテインメント、コミュニティを目的としたデジタルコレクティブルです。</p>\n      <p>KUON NFT は証券、投資商品、または金融商品ではありません。</p>\n      <p>KUON は、将来的な価値、希少性、実用性、市場需要、または今後の開発について保証しません。</p>\n      <p>NFT の価値は上昇、下落、または無価値になる可能性があります。</p>\n      <p>KUON への参加は、すべてユーザー自身の責任で行われます。</p>\n\n      <h2>8. 責任の制限</h2>\n      <p>ユーザーは、ブロックチェーン技術にスマートコントラクトの脆弱性、ネットワーク障害、デジタル資産の価格変動、第三者サービスの障害などの固有のリスクがあることを認識します。</p>\n      <p>KUON は以下について責任を負いません。</p>\n      <ul>\n        <li>ブロックチェーンの障害</li>\n        <li>ウォレットの侵害</li>\n        <li>スマートコントラクトの脆弱性</li>\n        <li>NFT価格の変動</li>\n        <li>マーケットプレイスの問題</li>\n        <li>技術的な中断</li>\n        <li>デジタル資産の損失</li>\n      </ul>\n      <p>すべてのサービスは「現状有姿」および「提供可能な範囲」で提供されます。</p>\n\n      <h2>9. 準拠・紛争解決</h2>\n      <p>本規約に起因する紛争は、まず誠実な協議によって解決されるものとします。</p>\n      <p>解決に至らない場合、適用法で認められる範囲において、仲裁またはその他適切な法的手続きに付される場合があります。</p>\n\n      <h2>10. 連絡先</h2>\n      <p>Website: kuonnft.xyz</p>\n      <p>X (Twitter): <a href="https://x.com/KUONNFT" target="_blank" rel="noopener noreferrer">@KUONNFT</a></p>\n      <p>Discord: 久遠 | KUON</p>\n\n      <p class="signature">KUON をご覧いただきありがとうございます。<br /><br />© 2026 KUON. All Rights Reserved.</p>`,
      privacyContent: `<h1>プライバシー・クレジット</h1>

<h2>プライバシー</h2>
<p>KUON は、ウェブサイト機能、分析、セキュリティ、ウォレット関連のやり取りに必要な限定的な情報を収集する場合があります。</p>
<p>収集される情報には、以下が含まれる場合があります。</p>
<ul>
  <li>ブラウザ情報</li>
  <li>デバイス情報</li>
  <li>ウォレットアドレス</li>
  <li>ウェブサイト利用分析</li>
</ul>
<p>KUON は、ユーザーの秘密鍵、シードフレーズ、ウォレットパスワードを要求、保存、またはアクセスしません。</p>
<p>KUON は個人情報を第三者に販売しません。</p>
<p>kuonnft.xyz を利用することにより、ユーザーは当該情報の収集および処理に同意したものとみなされます。</p>
<hr>
<h2>第三者サービス</h2>
<p>KUON は、ウォレットプロバイダー、分析プロバイダー、ホスティングサービス、ソーシャルメディアプラットフォーム、コンテンツプロバイダーなどの第三者サービスを利用する場合があります。</p>
<p>これらのサービスは、それぞれ独自の利用規約およびプライバシーポリシーに基づいて運営されています。</p>
<hr>
<h2>データセキュリティ</h2>
<p>KUON は、ウェブサイト機能およびユーザーとのやり取りを保護するために合理的な対策を講じます。ただし、電子送信または保存の方法に完全な安全性はなく、KUON は絶対的な安全性を保証することはできません。</p>
<hr>
<h2>免責事項</h2>
<p>KUON は、デジタルアートおよびストーリーテリングのプロジェクトです。</p>
<p>本ウェブサイトに含まれる内容は、金融助言、投資助言、法律助言、またはその他の専門的助言を構成するものではありません。</p>
<p>KUON NFT は、芸術、エンターテインメント、コミュニティを目的としたものです。</p>
<p>ユーザーは、デジタル資産、ブロックチェーン技術、および関連する活動について、自ら調査し判断する責任を負います。</p>
<hr>
<h2>ウォレットに関する免責事項</h2>
<p>ユーザーは、自身のウォレット、秘密鍵、シードフレーズ、パスワード、デバイス、インターネット接続の安全性を維持する責任を負います。</p>
<p>KUON は、紛失したウォレット、秘密鍵、シードフレーズ、パスワード、デジタル資産、またはブロックチェーン取引を復元することはできません。</p>
<p>すべてのブロックチェーン取引は最終的かつ取消不能です。</p>
<hr>
<h2>知的財産</h2>
<p>KUON のオリジナルアートワーク、ビジュアルデザイン、ロゴ、ブランド要素、物語、文章、ウェブサイトコンテンツ、および関連資産は、別途明記されない限り、適用される知的財産法により保護されています。</p>
<p>第三者のコンテンツは、それぞれの所有者に帰属し、該当するライセンスに基づいて使用されています。</p>
<hr>
<h2>責任の制限</h2>
<p>KUON、その制作者、貢献者、関連者、およびサービス提供者は、本ウェブサイトの利用に起因する直接的、間接的、偶発的、結果的、特別、懲罰的、または例示的な損害について責任を負いません。</p>
<p>これには、以下が含まれますが、これらに限定されません。</p>
<ul>
  <li>デジタル資産の損失</li>
  <li>ウォレットの侵害</li>
  <li>サービスの中断</li>
  <li>ウェブサイトの停止</li>
  <li>技術的な障害</li>
  <li>第三者プラットフォームの問題</li>
  <li>ブロックチェーンネットワークの問題</li>
</ul>
<p>すべてのサービスは「現状有姿」および「提供可能な範囲」で提供されます。</p>
<hr>
<h2>変更</h2>
<p>KUON は、事前の通知なく本プライバシー・クレジットページを修正、更新、改訂、または置き換える権利を留保します。</p>
<p>変更は、更新された改訂日とともにこのページに反映されます。</p>
<p>変更後もウェブサイトを継続して利用することにより、更新された内容に同意したものとみなされます。</p>
<hr>
<h2>音楽クレジット</h2>
<p>以下の音楽は、それぞれの Creative Commons ライセンスに基づいて使用されています。</p>
<h3>Ronin</h3>
<p>Ronin by yoitrax<br>https://soundcloud.com/yoitrax</p>
<p>Music promoted on https://www.chosic.com/free-music/all/</p>
<p>Creative Commons Attribution 3.0 Unported (CC BY 3.0)<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>Samurai Saké Showdown</h3>
<p>Samurai Saké Showdown by Darren Curtis<br>https://www.darrencurtismusic.com/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 3.0<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>Konnichiwa</h3>
<p>Konnichiwa by Alex-Productions<br>https://onsound.eu/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 3.0<br>https://creativecommons.org/licenses/by/3.0/</p>
<hr>
<h3>EpicBattle J</h3>
<p>EpicBattle J by PeriTune<br>https://peritune.com/</p>
<p>Music promoted by https://www.chosic.com/free-music/all/</p>
<p>Creative Commons CC BY 4.0<br>https://creativecommons.org/licenses/by/4.0/</p>
<hr>
<p>すべての音楽は各クリエイターの所有物であり、それぞれの Creative Commons ライセンスの条件に従って使用されています。</p>
<hr>
<h2>連絡先</h2>
<p>Website: kuonnft.xyz</p>
<p>X (Twitter): @KUONNFT</p>
<p>Discord: 久遠 | KUON</p>
<p>© 2026 KUON. All Rights Reserved.</p>`
    }
  };

  function applyLanguage(lang) {
    const safeLang = translations[lang] ? lang : 'en';
    document.documentElement.lang = safeLang === 'jp' ? 'ja' : 'en';
    document.documentElement.dataset.kuonLang = safeLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[safeLang][key]) el.textContent = translations[safeLang][key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (translations[safeLang][key]) el.innerHTML = translations[safeLang][key];
    });

    document.querySelectorAll('#homeLanguageSwitch button[data-lang]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === safeLang);
    });

    localStorage.setItem('kuonLanguage', safeLang);
    updateLoreNarrationSource(false);
    if (isLoreNarrationPlaying()) setLoreNarrationButton('pause');
    else if (loreNarration && loreNarration.ended) setLoreNarrationButton('replay');
    else setLoreNarrationButton('play');
  }

  document.querySelectorAll('#homeLanguageSwitch button[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });

  applyLanguage(localStorage.getItem('kuonLanguage') || 'en');
})();
