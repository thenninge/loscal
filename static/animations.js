/* ============================================
   SKYTTERLAG ANIMASJONER
   Velg mellom "gubbe" og "elg" animasjon
   ============================================ */

let currentAnimation = 'elg'; // 'elg' som standard - folk må tåle det!
let soundEnabled = true;
let audioContext = null;
let fakeErrorShown = false;

/* ============================================
   FAKE FEILMELDING - PRANK INTRO
   Ser ut som ekte feil, skjulte knapper for å fjerne
   ============================================ */


function showFakeError() {
    if (fakeErrorShown) return;
    if (sessionStorage.getItem('loscal_prank_seen')) return;
    
    fakeErrorShown = true;
    
    const container = document.getElementById('todayContent');
    if (!container) return;
    
    // Lag dato-streng som vanlig
    const now = new Date();
    const dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
    const weekday = dayNames[now.getDay()];
    const headingDate = `${weekday} ${now.getDate()}. ${monthNames[now.getMonth()]}`;
    
    // Sett inn fake error - ser ut som ekte lasting-feil
    container.innerHTML = `
        <div class="today-hero closed" id="fakeErrorContent">
            <p class="today-date">${headingDate}</p>
            <h2 class="today-status">Kunne ikke laste data</h2>
            <p class="today-substatus">Prøv å laste siden på nytt</p>
            <p class="fake-error-code">Feilkode: API_TOKEN_MISSING<span class="blink-cursor"></span></p>
            <div class="fake-error-actions">
                <a href="https://www.facebook.com/groups/lorenskogskytterlag/" 
                   target="_blank" 
                   class="btn-fallback">
                    Sjekk Facebook-gruppen
                </a>
            </div>
        </div>
    `;
    
    // Legg til skjulte knapper i header
    addSecretButtons();
}

function addSecretButtons() {
    const headerLinks = document.querySelector('.header-links');
    if (!headerLinks) return;
    
    const wwwBtn = document.getElementById('wwwBtn');
    const weatherBtn = document.getElementById('newWeatherBtn');
    
    // Skjult knapp til VENSTRE for web-knappen (første knapp)
    const leftSecret = document.createElement('button');
    leftSecret.className = 'secret-dismiss-btn btn btn-secondary';
    leftSecret.type = 'button';
    leftSecret.innerHTML = '&nbsp;';
    leftSecret.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dismissFakeError();
    };
    headerLinks.insertBefore(leftSecret, wwwBtn);
    
    // Skjult knapp til HØYRE for vær-knappen (oransje)
    const rightSecret = document.createElement('button');
    rightSecret.className = 'secret-dismiss-btn btn btn-secondary';
    rightSecret.type = 'button';
    rightSecret.innerHTML = '&nbsp;';
    rightSecret.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dismissFakeError();
    };
    headerLinks.appendChild(rightSecret);
}


function dismissFakeError() {
    // Fjern skjulte knapper
    document.querySelectorAll('.secret-dismiss-btn').forEach(el => el.remove());
    
    // Fjern fake error content
    const fakeContent = document.getElementById('fakeErrorContent');
    if (fakeContent) {
        fakeContent.remove();
    }
    
    sessionStorage.setItem('loscal_prank_seen', 'true');
    fakeErrorShown = false;
    
    // Nå kan renderToday kjøre igjen - refresh views
    if (typeof refreshViews === 'function') {
        refreshViews();
    }
}

function trackFacebookPrank() {
    console.log('🎯 Noen klikket på Facebook-lenken!');
}

// Initialiser Web Audio API
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// 8-bit lyd-generator
function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        const ctx = initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        switch(type) {
            case 'hoof':
                // Kort "klakk" lyd for elg-hover - varierer pitch
                oscillator.type = 'square';
                const hoofPitch = 120 + Math.random() * 80;
                oscillator.frequency.setValueAtTime(hoofPitch, now);
                oscillator.frequency.exponentialRampToValueAtTime(hoofPitch * 0.5, now + 0.04 + Math.random() * 0.02);
                gainNode.gain.setValueAtTime(0.08 + Math.random() * 0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.06);
                break;
                
            case 'stumble':
                // "Uff/Oi" lyd når jeger snubler - mer variasjon
                oscillator.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
                const stumbleStart = 150 + Math.random() * 150;
                oscillator.frequency.setValueAtTime(stumbleStart, now);
                oscillator.frequency.exponentialRampToValueAtTime(stumbleStart * 0.3, now + 0.15 + Math.random() * 0.1);
                gainNode.gain.setValueAtTime(0.12 + Math.random() * 0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.22);
                // Legg til boing etter stumble av og til
                if (Math.random() > 0.5) {
                    setTimeout(() => playSound('boing'), 150);
                }
                break;
                
            case 'wave':
                // Liten "nana-nana-boo-boo" melodi når elgen vinker
                const notes = [392, 330, 392, 330, 262]; // G4, E4, G4, E4, C4
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.08, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.1);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.1);
                });
                return; // Ikke bruk standard oscillator
                
            case 'pant':
                // Puste-lyd for slitne jegere - hæsj hæsj
                oscillator.type = 'sine';
                const pantBase = 350 + Math.random() * 100;
                oscillator.frequency.setValueAtTime(pantBase, now);
                oscillator.frequency.exponentialRampToValueAtTime(pantBase * 0.7, now + 0.08);
                oscillator.frequency.exponentialRampToValueAtTime(pantBase * 1.1, now + 0.16);
                oscillator.frequency.exponentialRampToValueAtTime(pantBase * 0.5, now + 0.25);
                gainNode.gain.setValueAtTime(0.04, now);
                gainNode.gain.linearRampToValueAtTime(0.07, now + 0.08);
                gainNode.gain.linearRampToValueAtTime(0.05, now + 0.16);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                oscillator.start(now);
                oscillator.stop(now + 0.25);
                break;
                
            case 'shot':
                // Skudd-lyd (bom!)
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'yell':
                // Jeger som roper "HEI!" eller "VENT!"
                oscillator.type = 'square';
                const yellFreq = 300 + Math.random() * 200;
                oscillator.frequency.setValueAtTime(yellFreq, now);
                oscillator.frequency.setValueAtTime(yellFreq * 1.2, now + 0.05);
                oscillator.frequency.setValueAtTime(yellFreq * 0.8, now + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(yellFreq * 0.5, now + 0.2);
                gainNode.gain.setValueAtTime(0.12, now);
                gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case 'whistle':
                // Fløyte-pip
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800 + Math.random() * 400, now);
                oscillator.frequency.setValueAtTime(1200 + Math.random() * 300, now + 0.08);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case 'bonk':
                // Når jeger treffer noe
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(250, now);
                oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'boing':
                // Spring-lyd når noen snubler
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
        }
    } catch (e) {
        console.log('Audio not available:', e);
    }
}

// Elg-lyd scheduler
let elgSoundInterval = null;

function startElgSounds() {
    if (elgSoundInterval) return;
    
    // Hover-lyder i ujevnt mønster - roligere tempo
    let hoofCount = 0;
    elgSoundInterval = setInterval(() => {
        if (!soundEnabled || currentAnimation !== 'elg') {
            stopElgSounds();
            return;
        }
        
        hoofCount++;
        
        // Hover med jevnere intervall
        if (hoofCount % 2 === 0) {
            playSound('hoof');
        }
        
        // Snuble-lyd sjeldnere
        if (hoofCount % 19 === 0) {
            playSound('stumble');
        }
        
        // Puste-lyd for jegerne
        if (hoofCount % 13 === 0) {
            playSound('pant');
        }
        
        // Vinke-melodi sjelden
        if (hoofCount % 41 === 0) {
            playSound('wave');
        }
        
    }, 350);
}

function stopElgSounds() {
    if (elgSoundInterval) {
        clearInterval(elgSoundInterval);
        elgSoundInterval = null;
    }
}

function createAnimationBanner() {
    const todayView = document.getElementById('todayView');
    if (!todayView) return;

    // Fjern eksisterende banner hvis den finnes
    const existing = document.getElementById('animationBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'animationBanner';
    banner.className = 'animation-banner';

    // Ingen toggle-knapper - folk må bare tåle det! 🦌

    if (currentAnimation === 'gubbe') {
        banner.innerHTML += createGubbeAnimation();
    } else {
        banner.innerHTML += createElgAnimation();
    }

    todayView.insertBefore(banner, todayView.firstChild);
}

function switchAnimation(type) {
    currentAnimation = type;
    stopElgSounds();
    createAnimationBanner();
    
    if (type === 'elg' && soundEnabled) {
        // Liten delay før lyd starter
        setTimeout(() => {
            if (currentAnimation === 'elg') {
                startElgSounds();
            }
        }, 500);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
        btn.classList.toggle('active', soundEnabled);
    }
    
    if (soundEnabled && currentAnimation === 'elg') {
        startElgSounds();
    } else {
        stopElgSounds();
    }
}

/* ============================================
   ANIMASJON 1: GUBBE-JAANSEN
   ============================================ */
function createGubbeAnimation() {
    return `
        <div class="gubbe-jaansen">
            <div class="gubbe">
                <div class="gubbe-hat"></div>
                <div class="gubbe-head"></div>
                <div class="gubbe-body"></div>
                <div class="gubbe-rifle"></div>
                <div class="gubbe-legs">
                    <div class="gubbe-leg left"></div>
                    <div class="gubbe-leg right"></div>
                </div>
            </div>
        </div>
        
        <div class="leirdue" style="animation-delay: 0s;">
            <div class="leirdue-wing left"></div>
            <div class="leirdue-body"></div>
            <div class="leirdue-wing right"></div>
            <div class="leirdue-face">😰</div>
        </div>
        <div class="leirdue" style="animation-delay: 2.5s;">
            <div class="leirdue-wing left"></div>
            <div class="leirdue-body"></div>
            <div class="leirdue-wing right"></div>
            <div class="leirdue-face">😱</div>
        </div>
        <div class="leirdue" style="animation-delay: 5s;">
            <div class="leirdue-wing left"></div>
            <div class="leirdue-body"></div>
            <div class="leirdue-wing right"></div>
            <div class="leirdue-face">😨</div>
        </div>
        <div class="leirdue" style="animation-delay: 7.5s;">
            <div class="leirdue-wing left"></div>
            <div class="leirdue-body"></div>
            <div class="leirdue-wing right"></div>
            <div class="leirdue-face">🫣</div>
        </div>
    `;
}

/* ============================================
   ANIMASJON 2: ELGEN SOM STIKKER AV
   ============================================ */
function createElgAnimation() {
    return `
        <div class="elg-chase">
            <!-- Elgen -->
            <div class="elg">
                <div class="elg-body">
                    <div class="elg-antler left"></div>
                    <div class="elg-antler right"></div>
                    <div class="elg-head">
                        <div class="elg-snout"></div>
                        <div class="elg-eye"></div>
                    </div>
                    <div class="elg-torso"></div>
                    <div class="elg-leg"></div>
                    <div class="elg-leg"></div>
                    <div class="elg-leg"></div>
                    <div class="elg-leg"></div>
                </div>
                <div class="elg-wave">👋</div>
            </div>
            
            <!-- Jegere -->
            <div class="jeger snubler">
                <div class="jeger-body">
                    <div class="jeger-hat"></div>
                    <div class="jeger-head"></div>
                    <div class="jeger-vest"></div>
                    <div class="jeger-pants">
                        <div class="jeger-leg left"></div>
                        <div class="jeger-leg right"></div>
                    </div>
                </div>
                <div class="jeger-sweat">💦</div>
            </div>
            
            <div class="jeger mister-lua" style="animation-delay: 0.6s;">
                <div class="jeger-body">
                    <div class="jeger-hat"></div>
                    <div class="jeger-head"></div>
                    <div class="jeger-vest"></div>
                    <div class="jeger-pants">
                        <div class="jeger-leg left"></div>
                        <div class="jeger-leg right"></div>
                    </div>
                </div>
                <div class="jeger-sweat">😤</div>
            </div>
            
            <div class="jeger" style="animation-delay: 1.2s;">
                <div class="jeger-body">
                    <div class="jeger-hat"></div>
                    <div class="jeger-head"></div>
                    <div class="jeger-vest"></div>
                    <div class="jeger-pants">
                        <div class="jeger-leg left"></div>
                        <div class="jeger-leg right"></div>
                    </div>
                </div>
                <div class="jeger-sweat">😅</div>
            </div>
            
            <div class="jeger snubler" style="animation-delay: 1.8s;">
                <div class="jeger-body">
                    <div class="jeger-hat"></div>
                    <div class="jeger-head"></div>
                    <div class="jeger-vest"></div>
                    <div class="jeger-pants">
                        <div class="jeger-leg left"></div>
                        <div class="jeger-leg right"></div>
                    </div>
                </div>
                <div class="jeger-sweat">🥵</div>
            </div>
        </div>
    `;
}

// Initialiser når DOM er klar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        createAnimationBanner();
        
        // Wrap renderToday for å blokkere den mens fake error vises
        if (!sessionStorage.getItem('loscal_prank_seen')) {
            const originalRenderToday = window.renderToday;
            window.renderToday = function(options) {
                // Hvis fake error vises, ikke gjør noe
                if (document.getElementById('fakeErrorContent')) {
                    return;
                }
                // Ellers kjør original
                if (originalRenderToday) {
                    originalRenderToday(options);
                }
            };
            
            // Vis fake error
            showFakeError();
        }
        
        // Start lyd og siktekors umiddelbart
        if (currentAnimation === 'elg' && soundEnabled) {
            startElgSounds();
        }
        
        // Aktiver siktekors med en gang
        if (!crosshairEnabled) {
            toggleCrosshair();
        }
        
        // Backup ved første klikk hvis browser blokkerte autostart
        document.addEventListener('click', function startEverythingOnClick(e) {
            // Start lyd hvis ikke allerede startet
            if (currentAnimation === 'elg' && soundEnabled && !elgSoundInterval) {
                startElgSounds();
            }
            
            document.removeEventListener('click', startEverythingOnClick);
        }, { once: true });
    }, 50);
});

/* ============================================
   USTABILT SIKTEKORS
   ============================================ */

let crosshairEnabled = false;
let crosshairElement = null;
let mouseX = 0;
let mouseY = 0;
let crosshairX = 0;
let crosshairY = 0;
let wobbleAngle = 0;
let crosshairAnimFrame = null;

const missTexts = ['BOM!', 'MISS!', 'Oi!', 'Nesten!', 'Bløff!', 'Hæ?', 'Prøv igjen!', 'Skjelansen!', 'Dust!', 'Typisk!'];

function createCrosshair() {
    if (crosshairElement) return;
    
    crosshairElement = document.createElement('div');
    crosshairElement.className = 'crosshair';
    crosshairElement.innerHTML = `
        <div class="crosshair-circle"></div>
        <div class="crosshair-dot"></div>
    `;
    document.body.appendChild(crosshairElement);
}

function removeCrosshair() {
    if (crosshairElement) {
        crosshairElement.remove();
        crosshairElement = null;
    }
    if (crosshairAnimFrame) {
        cancelAnimationFrame(crosshairAnimFrame);
        crosshairAnimFrame = null;
    }
}

function updateCrosshair() {
    if (!crosshairEnabled || !crosshairElement) return;
    
    // Wobble-effekt - siktet skjelver rundt musepekeren
    wobbleAngle += 0.15;
    const wobbleRadius = 8 + Math.sin(wobbleAngle * 0.7) * 4; // Varierende radius
    const wobbleX = Math.sin(wobbleAngle) * wobbleRadius + Math.sin(wobbleAngle * 2.3) * 3;
    const wobbleY = Math.cos(wobbleAngle * 1.1) * wobbleRadius + Math.cos(wobbleAngle * 1.7) * 3;
    
    // Smooth følging med lag
    crosshairX += (mouseX - crosshairX) * 0.3;
    crosshairY += (mouseY - crosshairY) * 0.3;
    
    // Legg til wobble
    const finalX = crosshairX + wobbleX;
    const finalY = crosshairY + wobbleY;
    
    crosshairElement.style.left = finalX + 'px';
    crosshairElement.style.top = finalY + 'px';
    
    crosshairAnimFrame = requestAnimationFrame(updateCrosshair);
}

function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function handleClick(e) {
    if (!crosshairEnabled) return;
    
    // Ikke vis BOM på knapper og kontroller
    if (e.target.closest('.animation-toggle') || 
        e.target.closest('button') || 
        e.target.closest('a') ||
        e.target.closest('input')) {
        return;
    }
    
    // Spill skudd-lyd
    playSound('shot');
    
    // Vis røykpuff der siktet faktisk er
    const smoke = document.createElement('div');
    smoke.className = 'smoke-puff';
    smoke.style.left = crosshairElement.style.left;
    smoke.style.top = crosshairElement.style.top;
    document.body.appendChild(smoke);
    setTimeout(() => smoke.remove(), 600);
    
    // Vis "BOM!" tekst
    const missText = document.createElement('div');
    missText.className = 'miss-effect';
    missText.textContent = missTexts[Math.floor(Math.random() * missTexts.length)];
    missText.style.left = crosshairElement.style.left;
    missText.style.top = crosshairElement.style.top;
    document.body.appendChild(missText);
    setTimeout(() => missText.remove(), 1000);
}

function toggleCrosshair() {
    crosshairEnabled = !crosshairEnabled;
    
    const btn = document.getElementById('crosshairToggle');
    if (btn) {
        btn.classList.toggle('active', crosshairEnabled);
    }
    
    if (crosshairEnabled) {
        document.body.classList.add('crosshair-active');
        createCrosshair();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        updateCrosshair();
    } else {
        document.body.classList.remove('crosshair-active');
        removeCrosshair();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
    }
}

// Eksporter for global tilgang
window.switchAnimation = switchAnimation;
window.toggleSound = toggleSound;
window.toggleCrosshair = toggleCrosshair;
window.createAnimationBanner = createAnimationBanner;
