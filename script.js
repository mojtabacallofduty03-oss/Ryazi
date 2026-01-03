// --- 1. لودینگ ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }, 800);
});

// --- 2. منو و تم ---
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    menu.classList.toggle('active');
    overlay.style.display = menu.classList.contains('active') ? 'block' : 'none';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

// --- 3. پس‌زمینه ریاضی (Canvas) ---
const canvas = document.getElementById('math-grid-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const symbols = ['∑', '∫', 'π', '√', '∞', '÷', '×', '%'];
const particles = [];
for(let i=0; i<15; i++) {
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        sym: symbols[Math.floor(Math.random() * symbols.length)],
        size: 20 + Math.random() * 20,
        speed: 0.5 + Math.random()
    });
}

function animateBg() {
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#eef2f5' : '#050510';
    ctx.fillRect(0,0,width,height);
    
    // شبکه
    ctx.strokeStyle = document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.05)' : 'rgba(0, 243, 255, 0.1)';
    ctx.beginPath();
    for(let x=0; x<width; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
    for(let y=0; y<height; y+=50) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
    ctx.stroke();

    // نمادها
    ctx.font = 'bold 20px Arial'; // استفاده از فونت پیش‌فرض برای نمادهای متنی روی بوم
    ctx.fillStyle = document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.2)' : 'rgba(0, 243, 255, 0.3)';
    particles.forEach(p => {
        ctx.fillText(p.sym, p.x, p.y);
        p.y -= p.speed;
        if(p.y < -50) p.y = height + 50;
    });
    requestAnimationFrame(animateBg);
}
animateBg();

// --- 4. منطق ماشین محاسبات ---
function parseInput(str) {
    if(!str) return new Set();
    return new Set(str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)));
}

function fillExample() {
    document.getElementById('inputA').value = "1, 2, 3, 4, 5";
    document.getElementById('inputB').value = "4, 5, 6, 7, 8";
    calcSet('union');
}

function calcSet(op) {
    const setA = parseInput(document.getElementById('inputA').value);
    const setB = parseInput(document.getElementById('inputB').value);
    const resultBox = document.getElementById('resultBox');
    
    let result = [];
    
    if (op === 'union') {
        const union = new Set([...setA, ...setB]);
        result = Array.from(union).sort((a,b)=>a-b);
    } else if (op === 'intersection') {
        result = [...setA].filter(x => setB.has(x));
    } else if (op === 'diff') {
        result = [...setA].filter(x => !setB.has(x));
    }

    if (result.length === 0) {
        resultBox.innerHTML = '<span style="color: #ff4757;">مجموعه تهی (∅)</span>';
    } else {
        resultBox.innerHTML = '';
        result.forEach((num, index) => {
            const bubble = document.createElement('div');
            bubble.className = 'result-bubble';
            bubble.innerText = num;
            bubble.style.animationDelay = `${index * 0.1}s`;
            resultBox.appendChild(bubble);
        });
    }
}

// --- 5. منطق بازی ---
let score = 0;
let timer = 60;
let gameInterval;
let currentNum = 0;
let isPlaying = false;

function initGame() {
    score = 0;
    timer = 60;
    isPlaying = true;
    document.getElementById('score').innerText = score;
    document.getElementById('timer').innerText = timer;
    document.getElementById('gameOverlay').style.display = 'none';
    
    nextQuestion();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').innerText = timer;
        if (timer <= 0) endGame();
    }, 1000);
}

function nextQuestion() {
    if (!isPlaying) return;
    currentNum = Math.floor(Math.random() * 100) + 1;
    document.getElementById('qArea').innerHTML = `
        آیا عدد <span class="highlight-num">${currentNum}</span><br>
        <span style="font-size: 1.5rem; font-weight: normal;">زوج یا مضرب ۵ است؟</span>
    `;
}

function checkRule(num) {
    return (num % 2 === 0) || (num % 5 === 0);
}

function gameAnswer(userSaysYes) {
    if (!isPlaying) return;
    const correct = checkRule(currentNum);
    const qArea = document.getElementById('qArea');

    if (userSaysYes === correct) {
        score += 10;
        document.getElementById('score').innerText = score;
        qArea.style.textShadow = "0 0 20px #00f3ff";
    } else {
        qArea.style.textShadow = "0 0 20px #ff4757";
    }
    setTimeout(() => qArea.style.textShadow = "none", 200);
    nextQuestion();
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    document.getElementById('gameOverlay').style.display = 'flex';
    document.getElementById('finalScore').innerText = score;
}

// شروع بازی با کلیک اولیه
document.querySelectorAll('.btn-game').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isPlaying && timer === 60 && score === 0) initGame();
    });
});