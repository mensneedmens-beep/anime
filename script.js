// --- SMART GITHUB IMAGE LOADER ---
function loadGitHubImages() {
    const baseUrl = "https://raw.githubusercontent.com/mensneedmens-beep/anime/main/";
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach((card, index) => {
        let imgNum = index + 1;
        let jpgUrl = `${baseUrl}${imgNum}.jpg`;
        let pngUrl = `${baseUrl}${imgNum}.png`;

        card.style.backgroundImage = `url('${jpgUrl}')`;
        let imgTest = new Image();
        imgTest.onerror = function() { card.style.backgroundImage = `url('${pngUrl}')`; };
        imgTest.src = jpgUrl;
    });
}

// --- Core Systems & State ---
let balance = 10000;
let isGameRunning = false;

function initSystem() {
    loadGitHubImages(); 
    updateBalance(); 
    startChatBot(); 
    setupSlots(); 
    setupTowers(); 
    setupKeno();
}

// --- NEW "HIDDEN" ADMIN SYSTEM ---
// Base64 encoded string for "pruthviwillwin"
const SECRET_PIN = "cHJ1dGh2aXdpbGx3aW4="; 

function adminAccess() {
    let pin = prompt("Enter Admin PIN (Warning: Incorrect PIN deducts 10 &!):");
    if (pin === null) return;

    // btoa() converts the typed pin to Base64 so we can compare it safely-ish
    if (btoa(pin) === SECRET_PIN) {
        let newBal = prompt("Access Granted. Enter new balance:");
        let val = parseFloat(newBal);
        if (!isNaN(val) && val >= 0) {
            balance = val;
            updateBalance();
            playWinSound();
            msg('hub', `Admin Override: Balance updated to & ${balance.toLocaleString('en-US')}`, 'win');
        }
    } else {
        playLoseSound();
        if (balance >= 10) balance -= 10;
        else balance = 0;
        updateBalance();
        alert("INCORRECT PIN! Penalty applied: -10 &");
        msg('hub', "Unauthorized access attempt. Penalty applied.", 'lose');
    }
}

// --- MUSIC LOGIC ---
let isMusicPlaying = false;
function toggleMusic() {
    const bgMusic = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    
    if (isMusicPlaying) {
        bgMusic.pause();
        btn.innerText = '🔇';
    } else {
        bgMusic.volume = 0.3; // Low background volume
        bgMusic.play().catch(e => console.log("Audio blocked by browser:", e));
        btn.innerText = '🔊';
    }
    isMusicPlaying = !isMusicPlaying;
}

function changeTheme() {
    const t = document.getElementById('theme-selector').value;
    if (t === 'premium' && balance < 10000000) {
        alert("ACCESS DENIED: You need a Net Profit of 10,000,000 & to unlock the Premium Theme!");
        document.getElementById('theme-selector').value = document.documentElement.getAttribute('data-theme') || 'light';
        return;
    }
    if (t === 'premium') { playWinSound(); }
    document.documentElement.setAttribute('data-theme', t);
}

function updateBalance() { document.getElementById('balance-display').innerText = balance.toLocaleString('en-US'); }

function deduct(amount) {
    if (amount > balance || amount <= 0 || isNaN(amount)) return false;
    balance -= amount; updateBalance(); return true;
}

function addWin(amount) { balance += amount; updateBalance(); }

// Audio
function playWinSound() { new Audio('https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3').play().catch(()=>{}); }
function playLoseSound() { new Audio('https://www.myinstants.com/media/sounds/fahhhhhhhhhhhhhh.mp3').play().catch(()=>{}); }

// Nav
function nav(view) {
    if (isGameRunning) return;
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if(view !== 'hub') {
        const btn = Array.from(document.querySelectorAll('.nav-item')).find(b => b.onclick.toString().includes(view));
        if(btn) btn.classList.add('active');
    } else { document.querySelector('.nav-item:first-child').classList.add('active'); }
}

function msg(game, text, type) { const el = document.getElementById(`msg-${game}`); if(el) { el.innerText = text; el.className = `game-msg text-${type}`; } }

// Chat
const chatBox = document.getElementById('chat-box');
const bots = ['ShadowKing', 'WaifuFan', 'CryptoWhale', 'Dark_Soul', 'PremiumUser99'];
const phrases = ["Just hit a 14x on Roulette!!", "Crabs got me again 😭", "I need 10M & for that Premium Theme.", "The Premium UI looks incredible 😍", "Going all in!"];
function addChat(user, text) { chatBox.innerHTML += `<div class="msg"><span class="msg-user">${user}</span><span class="msg-text">${text}</span></div>`; chatBox.scrollTop = chatBox.scrollHeight; }
function sendChat() { const i = document.getElementById('chat-input'); if(i.value.trim()!==''){ addChat('You', i.value); i.value=''; } }
function startChatBot() { setInterval(() => { if (Math.random() > 0.4) addChat(bots[Math.floor(Math.random()*bots.length)], phrases[Math.floor(Math.random()*phrases.length)]); }, 4000); }

// --- Games Logic ---

// 1. Slots (UPDATED: 8 emojis, Match 7+ to win to make losing common)
const EMOJIS = ['💎', '🍒', '🔔', '7️⃣', '🍉', '🍋', '⭐', '🍇'];
let slotCells = [];
function setupSlots() {
    const grid = document.getElementById('slots-grid'); grid.innerHTML = ''; slotCells = [];
    for(let i=0; i<25; i++) { const c = document.createElement('div'); c.className = 'grid-cell'; c.innerText = EMOJIS[Math.floor(Math.random()*EMOJIS.length)]; grid.appendChild(c); slotCells.push(c); }
}
function playSlots() {
    const bet = parseFloat(document.getElementById('slots-bet').value);
    if (!deduct(bet)) { msg('slots', 'Insufficient Balance!', 'lose'); return; }
    isGameRunning = true; document.getElementById('btn-slots').disabled = true; msg('slots', 'Spinning...', 'normal');
    slotCells.forEach(c => c.style.borderColor = 'var(--border-color)');
    let spins = 0;
    const iv = setInterval(() => {
        slotCells.forEach(c => c.innerText = EMOJIS[Math.floor(Math.random()*EMOJIS.length)]);
        spins++;
        if (spins > 15) {
            clearInterval(iv);
            let counts = {}; slotCells.forEach(c => { counts[c.innerText] = (counts[c.innerText]||0)+1; });
            let max = 0; let winE = ''; for (const [e, c] of Object.entries(counts)) { if(c>max){max=c; winE=e;} }
            
            if (max >= 7) {
                let win = bet * (max === 7 ? 1.5 : (max >= 9 ? 3 : 10));
                slotCells.forEach(c => { if(c.innerText===winE) c.style.borderColor='var(--accent)'; });
                addWin(win); playWinSound(); msg('slots', `Found ${max} ${winE}! Won & ${win.toFixed(2)}`, 'win');
            } else { 
                playLoseSound(); msg('slots', `Highest match was ${max}. Need 7+. Lost.`, 'lose'); 
            }
            document.getElementById('btn-slots').disabled = false; isGameRunning = false;
        }
    }, 80);
}

// 2. Crash
let crashAnim;
function playCrash() {
    const bet = parseFloat(document.getElementById('crash-bet').value);
    if (!deduct(bet)) { msg('crash', 'Insufficient Funds', 'lose'); return; }
    isGameRunning = true; let mult = 1.00; let target = Math.max(1.01, (0.99 / (1 - Math.random()))); if(Math.random()<0.05) target=1.00;
    const btn = document.getElementById('btn-crash'); const mEl = document.getElementById('crash-mult'); const r = document.getElementById('crash-rocket');
    btn.innerText = "CASH OUT"; btn.onclick = () => { cancelAnimationFrame(crashAnim); let win = bet*mult; addWin(win); playWinSound(); msg('crash', `Cashed out! +& ${win.toFixed(2)}`, 'win'); resetCrash(); };
    mEl.style.color = "var(--text-main)"; msg('crash', 'Flying...', 'normal');
    let start = performance.now();
    function tick(now) {
        let el = now - start; mult = Math.pow(Math.E, 0.00006 * el); mEl.innerText = mult.toFixed(2) + "x";
        r.style.transform = `translate(${Math.min(400, el/20)}px, -${Math.min(200, el/25)}px)`;
        if (mult >= target) { cancelAnimationFrame(crashAnim); mEl.innerText = target.toFixed(2) + "x"; mEl.style.color = "var(--danger)"; playLoseSound(); msg('crash', `Crashed at ${target.toFixed(2)}x.`, 'lose'); resetCrash(); }
        else crashAnim = requestAnimationFrame(tick);
    }
    crashAnim = requestAnimationFrame(tick);
}
function resetCrash() { document.getElementById('btn-crash').innerText = "LAUNCH"; document.getElementById('btn-crash').onclick = playCrash; document.getElementById('crash-rocket').style.transform="none"; isGameRunning = false; }

// 3. Mines
let mineState = 'idle'; let mineClicks = 0; let mineBet = 0; let mineCount = 0; let bombArray = []; let gridBtns = [];
function startMines() {
    const btn = document.getElementById('btn-mines');
    if (mineState === 'playing') {
        let win = mineBet * calcMineMult(mineClicks, mineCount); addWin(win); playWinSound(); msg('mines', `Cashed out! +& ${win.toFixed(2)}`, 'win'); endMines(); return;
    }
    mineBet = parseFloat(document.getElementById('mines-bet').value); mineCount = parseInt(document.getElementById('mines-count').value);
    if(mineCount<1||mineCount>24||!deduct(mineBet)){ msg('mines', 'Invalid Bet/Bombs', 'lose'); return; }
    
    isGameRunning = true; mineState = 'playing'; mineClicks = 0;
    bombArray = []; while(bombArray.length < mineCount){ let r = Math.floor(Math.random()*25); if(!bombArray.includes(r)) bombArray.push(r); }
    
    const grid = document.getElementById('mines-grid'); grid.innerHTML = ''; gridBtns = [];
    for(let i=0; i<25; i++) {
        let b = document.createElement('div'); b.className = 'grid-cell'; b.style.cursor='pointer';
        b.onclick = () => {
            if(mineState!=='playing'||b.classList.contains('revealed')) return;
            if(bombArray.includes(i)){ b.classList.add('revealed'); b.innerText = '💣'; b.style.background='#ef4444'; playLoseSound(); msg('mines', 'Boom! You lost.', 'lose'); endMines(); }
            else {
                mineClicks++; b.classList.add('revealed'); b.innerText = '💎'; b.style.background='#10b981';
                let mult = calcMineMult(mineClicks, mineCount); btn.innerText = `CASH OUT (${mult.toFixed(2)}x)`; msg('mines', `Safe! Next mult: ${calcMineMult(mineClicks+1, mineCount).toFixed(2)}x`, 'normal');
                if(mineClicks === 25-mineCount) { let win = mineBet*mult; addWin(win); playWinSound(); msg('mines', `Cleared! +& ${win.toFixed(2)}`, 'win'); endMines(); }
            }
        };
        grid.appendChild(b); gridBtns.push(b);
    }
    btn.innerText = "CASH OUT (1.00x)"; msg('mines', 'Find the gems!', 'normal');
}
function endMines() { gridBtns.forEach((b,i)=>{ if(!b.classList.contains('revealed')){ b.style.opacity=0.5; b.innerText=bombArray.includes(i)?'💣':'💎'; }}); document.getElementById('btn-mines').innerText = "START CLEARING"; mineState='idle'; isGameRunning=false; }
function calcMineMult(c, m) { let p=1; for(let i=0;i<c;i++) p*=(25-m-i)/(25-i); return c===0?1:(0.99/p); }

// 4. Wheel
function playWheel() {
    const bet = parseFloat(document.getElementById('wheel-bet').value);
    if (!deduct(bet)) { msg('wheel', 'Insufficient Balance!', 'lose'); return; }
    isGameRunning = true; document.getElementById('btn-wheel').disabled = true; msg('wheel', 'Spinning...', 'normal');
    
    const multMap = [0, 2, 5, 0, 2, 5]; 
    let spins = 5; let randDeg = Math.floor(Math.random()*360);
    let totalRot = (360*spins) + randDeg;
    document.getElementById('wheel-obj').style.transform = `rotate(${totalRot}deg)`;
    
    setTimeout(() => {
        let finalDeg = totalRot % 360; let topDeg = (360 - finalDeg) % 360; let index = Math.floor(topDeg / 60);
        let result = multMap[index];
        
        if (result > 0) { let win = bet*result; addWin(win); playWinSound(); msg('wheel', `Landed on ${result}x! +& ${win.toFixed(2)}`, 'win'); }
        else { playLoseSound(); msg('wheel', 'Landed on 0x. Lost bet.', 'lose'); }
        
        document.getElementById('btn-wheel').disabled = false; isGameRunning = false;
    }, 3000);
}

// 5. Coin
function playCoin(guess) {
    const bet = parseFloat(document.getElementById('coin-bet').value);
    if (isGameRunning || !deduct(bet)) return;
    isGameRunning = true; msg('coin', 'Flipping...', 'normal');
    const coin = document.getElementById('coin-obj');
    let isBlue = Math.random() > 0.5;
    coin.innerText = "🔄";
    setTimeout(() => {
        let res = isBlue ? 'blue' : 'red';
        coin.innerText = isBlue ? "🔵" : "🔴";
        if(guess === res) { addWin(bet*2); playWinSound(); msg('coin', `Winner! +& ${(bet*2).toFixed(2)}`, 'win'); }
        else { playLoseSound(); msg('coin', 'Wrong side. Lost.', 'lose'); }
        isGameRunning = false;
    }, 1000);
}

// 6. Dice
function updateDicePayout() { let val = document.getElementById('dice-slider').value; document.getElementById('dice-target-display').innerText = val; document.getElementById('dice-payout').innerText = (99/val).toFixed(2)+'x'; }
function playDice() {
    const bet = parseFloat(document.getElementById('dice-bet').value); let target = parseInt(document.getElementById('dice-slider').value);
    if (isGameRunning || !deduct(bet)) return;
    isGameRunning = true; msg('dice', 'Rolling...', 'normal');
    let roll = (Math.random()*100).toFixed(2);
    let display = document.getElementById('dice-result'); display.innerText = roll;
    setTimeout(() => {
        if (parseFloat(roll) < target) { let win = bet*(99/target); addWin(win); playWinSound(); display.style.color="#10b981"; msg('dice', `Rolled under! +& ${win.toFixed(2)}`, 'win'); }
        else { playLoseSound(); display.style.color="#ef4444"; msg('dice', 'Rolled over. Lost.', 'lose'); }
        setTimeout(()=> { display.style.color="var(--accent)"; isGameRunning = false; }, 1500);
    }, 500);
}

// 7. Cards
let currentCard = 0; let cardActive = false;
function initCardGame() {
    const bet = parseFloat(document.getElementById('cards-bet').value);
    if (isGameRunning || !deduct(bet)) return;
    cardActive = true; document.getElementById('btn-card-start').style.display='none';
    currentCard = Math.floor(Math.random()*13)+1; document.getElementById('card-display').innerText = currentCard;
    msg('cards', 'Will the next be Higher or Lower?', 'normal');
}
function playCards(guess) {
    if(!cardActive || isGameRunning) return; isGameRunning = true;
    let nextCard = Math.floor(Math.random()*13)+1; document.getElementById('card-display').innerText = nextCard;
    if(nextCard === currentCard) { addWin(document.getElementById('cards-bet').value); msg('cards', 'Draw. Bet returned.', 'normal'); }
    else if((guess==='high' && nextCard>currentCard) || (guess==='low' && nextCard<currentCard)){ let win=parseFloat(document.getElementById('cards-bet').value)*2; addWin(win); playWinSound(); msg('cards', `Correct! +& ${win.toFixed(2)}`, 'win'); }
    else { playLoseSound(); msg('cards', 'Wrong. Lost bet.', 'lose'); }
    setTimeout(()=>{ cardActive=false; isGameRunning=false; document.getElementById('btn-card-start').style.display='block'; document.getElementById('card-display').innerText='?'; }, 1500);
}

// 8. Gacha
function playChest(idx) {
    const bet = parseFloat(document.getElementById('chests-bet').value);
    if (isGameRunning || !deduct(bet)) return;
    isGameRunning = true;
    let winIdx = Math.floor(Math.random()*3);
    let boxes = document.querySelectorAll('#chests-container .grid-cell');
    boxes.forEach((b,i) => { b.innerText = (i===winIdx) ? '💎' : '💨'; });
    if(idx === winIdx) { let win=bet*2.5; addWin(win); playWinSound(); msg('chests', `Jackpot! +& ${win.toFixed(2)}`, 'win'); }
    else { playLoseSound(); msg('chests', 'Empty box!', 'lose'); }
    setTimeout(()=>{ boxes.forEach(b=>b.innerText='🎁'); isGameRunning=false; }, 1500);
}

// 9. Towers
let towerRow = 0; let towerActive = false; let towerBet=0;
function setupTowers() {
    let grid = document.getElementById('towers-grid'); grid.innerHTML = '';
    for(let i=0; i<5; i++) {
        let row = document.createElement('div'); row.className = 'flex-row'; row.style.margin = '0'; row.id=`t-row-${i}`;
        for(let j=0; j<3; j++) { let b=document.createElement('div'); b.className='grid-cell'; b.style.width='80px'; b.style.height='50px'; b.innerText='?'; b.style.cursor='pointer'; b.onclick=()=>clickTower(i,j,b); row.appendChild(b); }
        grid.appendChild(row);
    }
}
function startTowers() {
    const btn = document.getElementById('btn-towers');
    if(towerActive) { let win = towerBet * Math.pow(1.4, towerRow); addWin(win); playWinSound(); msg('towers', `Cashed out! +& ${win.toFixed(2)}`, 'win'); towerActive=false; btn.innerText="START CLIMB"; setupTowers(); return; }
    towerBet = parseFloat(document.getElementById('towers-bet').value); if(!deduct(towerBet)) return;
    towerActive = true; towerRow = 0; setupTowers(); btn.innerText="CASH OUT (1.00x)"; msg('towers', 'Pick a block on the bottom row.', 'normal');
    document.getElementById('t-row-0').style.borderColor = 'var(--accent)';
}
function clickTower(r, c, btn) {
    if(!towerActive || r!==towerRow || btn.innerText!=='?') return;
    let bombCol = Math.floor(Math.random()*3);
    if(c === bombCol) { btn.innerText='💣'; btn.style.background='#ef4444'; playLoseSound(); msg('towers', 'Hit a bomb!', 'lose'); towerActive=false; document.getElementById('btn-towers').innerText="START CLIMB"; }
    else {
        btn.innerText='⭐'; btn.style.background='#10b981'; towerRow++;
        let mult = Math.pow(1.4, towerRow); document.getElementById('btn-towers').innerText=`CASH OUT (${mult.toFixed(2)}x)`;
        document.getElementById(`t-row-${r}`).style.borderColor = 'var(--border-color)';
        if(towerRow<5) { document.getElementById(`t-row-${towerRow}`).style.borderColor = 'var(--accent)'; msg('towers', `Safe! Pick row ${towerRow+1}`, 'normal'); }
        else { let win = towerBet*mult; addWin(win); playWinSound(); msg('towers', `Reached the top! +& ${win.toFixed(2)}`, 'win'); towerActive=false; document.getElementById('btn-towers').innerText="START CLIMB"; }
    }
}

// 10. Plinko
function playPlinko() {
    const bet = parseFloat(document.getElementById('plinko-bet').value);
    if (isGameRunning || !deduct(bet)) return;
    isGameRunning = true; msg('plinko', 'Dropping...', 'normal');
    let mults = [0.2, 1.5, 3.0, 1.5, 0.2]; let slots = [-100, -50, 0, 50, 100];
    let r = Math.random(); let idx = r<0.1 ? 2 : (r<0.4 ? (Math.random()>0.5?1:3) : (Math.random()>0.5?0:4)); 
    
    let ball = document.getElementById('plinko-ball');
    ball.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    ball.style.transform = `translate(${slots[idx]}px, 100px)`; 
    
    setTimeout(()=>{
        let win = bet*mults[idx]; addWin(win); 
        if(mults[idx]>=1) { playWinSound(); msg('plinko', `Landed in ${mults[idx]}x! +& ${win.toFixed(2)}`, 'win'); }
        else { playLoseSound(); msg('plinko', `Landed in ${mults[idx]}x. Lost & ${(bet-win).toFixed(2)}`, 'lose'); }
        setTimeout(()=>{ ball.style.transition='none'; ball.style.transform='translate(0,0)'; isGameRunning=false; }, 1000);
    }, 1500);
}

// 11. Roulette
function playRoulette(color) {
    const bet = parseFloat(document.getElementById('roulette-bet').value);
    if (isGameRunning || !deduct(bet)) return;
    isGameRunning = true; msg('roulette', 'Spinning wheel...', 'normal');
    const obj = document.getElementById('roulette-obj');
    
    let count = 0;
    let iv = setInterval(() => {
        let r = Math.random();
        obj.style.borderColor = r < 0.48 ? '#ef4444' : (r > 0.96 ? '#10b981' : '#1f2937');
        count++;
        if (count > 20) {
            clearInterval(iv);
            let finalR = Math.random();
            let resColor = finalR < 0.48 ? 'red' : (finalR > 0.96 ? 'green' : 'black');
            obj.style.borderColor = resColor === 'red' ? '#ef4444' : (resColor === 'green' ? '#10b981' : '#1f2937');
            
            if (resColor === color) {
                let mult = color === 'green' ? 14 : 2;
                let win = bet * mult; addWin(win); playWinSound(); msg('roulette', `Landed ${resColor.toUpperCase()}! Won & ${win.toFixed(2)}`, 'win');
            } else {
                playLoseSound(); msg('roulette', `Landed ${resColor.toUpperCase()}. You lost.`, 'lose');
            }
            isGameRunning = false;
        }
    }, 100);
}

// 12. Keno
let selectedKeno = -1;
function setupKeno() {
    const grid = document.getElementById('keno-grid'); grid.innerHTML = '';
    for(let i=1; i<=10; i++) {
        let b = document.createElement('div'); b.className = 'grid-cell'; b.innerText = i; b.style.cursor='pointer';
        b.onclick = () => { if(isGameRunning)return; document.querySelectorAll('#keno-grid .grid-cell').forEach(c=>c.style.background='var(--bg-base)'); b.style.background='var(--accent)'; selectedKeno=i; document.getElementById('btn-keno').disabled=false; };
        grid.appendChild(b);
    }
}
function playKeno() {
    const bet = parseFloat(document.getElementById('keno-bet').value);
    if (!deduct(bet)) { msg('keno', 'Insufficient Balance!', 'lose'); return; }
    isGameRunning = true; msg('keno', 'Drawing number...', 'normal');
    
    setTimeout(() => {
        let draw = Math.floor(Math.random()*10)+1;
        document.querySelectorAll('#keno-grid .grid-cell').forEach(c=>{ if(parseInt(c.innerText)===draw) c.style.borderColor='#10b981'; });
        
        if (draw === selectedKeno) { let win=bet*9; addWin(win); playWinSound(); msg('keno', `Number ${draw} hit! Won & ${win.toFixed(2)}`, 'win'); }
        else { playLoseSound(); msg('keno', `Drew ${draw}. You missed.`, 'lose'); }
        
        setTimeout(() => { document.querySelectorAll('#keno-grid .grid-cell').forEach(c=>c.style.borderColor='var(--border-color)'); isGameRunning=false; }, 2000);
    }, 1000);
}

// Boot up
window.onload = initSystem;
