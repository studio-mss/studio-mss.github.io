/* script.js */

// ============================================================
// [DATABASE]
// ============================================================
const row1_data = [
    { title: "Project Alpha", desc: "Arch / 2024", color: "#999999", bigText: "1-1", type: "Medium" },
    { title: "Beta House",    desc: "Int / 2023",  color: "#aaaaaa", bigText: "1-2", type: "Syntax" },
    { title: "Gamma Villa",   desc: "Des / 2025",  color: "#bbbbbb", bigText: "1-3", type: "Scale" },
];

const row2_data = [
    { title: "Neon City",  desc: "Urb / 2024", color: "#888888", bigText: "2-1", type: "Medium" },
    { title: "Cyber Loft", desc: "Ren / 2023", color: "#999999", bigText: "2-2", type: "Syntax" },
    { title: "Flux Tower", desc: "Art / 2024", color: "#777777", bigText: "2-3", type: "Scale" }
];

const row3_data = [
    { title: "Dark Matter", desc: "Exh / 2024", color: "#555555", bigText: "3-1", type: "Scale" },
    { title: "Gray Scale",  desc: "Pho / 2025", color: "#666666", bigText: "3-2", type: "Medium" },
    { title: "Steel Frame", desc: "Con / 2023", color: "#777777", bigText: "3-3", type: "Syntax" },
    { title: "Iron Works",  desc: "Art / 2022", color: "#888888", bigText: "3-4", type: "Scale" },
];

// 전역 변수 (필터 변경 시 애니메이션 초기화용)
let animations = [];

// ============================================================
// [PHYSICS ENGINE] 관성 스크롤 클래스
// ============================================================
class InertiaMarquee {
    constructor(element, baseSpeed) {
        this.el = element;
        this.baseSpeed = baseSpeed; // 기본 흐름 속도 (예: 0.5)
        this.currentPos = 0;
        this.velocity = -baseSpeed; // 현재 속도
        this.targetVelocity = -baseSpeed; // 목표 속도 (원래 흐름)
        
        this.isDragging = false;
        this.isHovered = false;
        
        this.startX = 0;
        this.lastX = 0;
        this.lastMouseX = 0; // 관성 계산용 마지막 마우스 위치
        
        this.rafId = null;
        this.totalWidth = 0;

        // 로딩 후 길이 계산
        setTimeout(() => {
            if (this.el.children.length > 0) {
                // 3배수 복사했으므로 전체의 1/3이 1세트 길이
                this.totalWidth = this.el.scrollWidth / 3;
            }
        }, 500);

        this.initEvents();
        this.animate();
    }

    // 부드러운 감속/가속 공식 (Linear Interpolation)
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    initEvents() {
        // 호버 체크
        this.el.addEventListener('mouseenter', () => { this.isHovered = true; });
        this.el.addEventListener('mouseleave', () => { 
            this.isHovered = false; 
            this.isDragging = false; 
        });

        // --- 마우스 이벤트 ---
        this.el.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.pageX;
            this.lastX = this.currentPos;
            this.lastMouseX = e.pageX;
            this.velocity = 0; // 드래그 시작하면 기존 속도 초기화
            this.el.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            const diff = e.pageX - this.startX;
            this.currentPos = this.lastX + diff;
            
            // 관성을 위해 놓기 직전의 속도 계산 (현재위치 - 직전위치)
            this.velocity = e.pageX - this.lastMouseX; 
            this.lastMouseX = e.pageX;
        });

        window.addEventListener('mouseup', () => {
            if(this.isDragging) {
                this.isDragging = false;
                this.el.style.cursor = 'grab';
            }
        });

        // --- 모바일 터치 이벤트 ---
        this.el.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.startX = e.touches[0].pageX;
            this.lastX = this.currentPos;
            this.lastMouseX = e.touches[0].pageX;
            this.velocity = 0;
        });

        this.el.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const diff = e.touches[0].pageX - this.startX;
            this.currentPos = this.lastX + diff;
            
            this.velocity = e.touches[0].pageX - this.lastMouseX;
            this.lastMouseX = e.touches[0].pageX;
        });

        this.el.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    animate() {
        if (!this.isDragging) {
            // 1. 목표 속도 설정
            // 마우스가 올라가 있으면 0 (멈춤), 아니면 기본 속도로 흐름
            let target = this.isHovered ? 0 : -this.baseSpeed;

            // 2. 현재 속도를 목표 속도로 부드럽게 변경 (관성 효과 핵심)
            // 0.05는 마찰계수 (작을수록 더 많이 미끄러짐)
            this.velocity = this.lerp(this.velocity, target, 0.05);

            // 3. 위치 업데이트
            this.currentPos += this.velocity;
        }

        // 4. 무한 스크롤 텔레포트 (Loop)
        if (this.totalWidth > 0) {
            if (this.currentPos <= -this.totalWidth) {
                this.currentPos += this.totalWidth;
            } else if (this.currentPos > 0) {
                this.currentPos -= this.totalWidth;
            }
        }

        // 5. 화면 그리기
        this.el.style.transform = `translateX(${this.currentPos}px)`;

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    destroy() {
        cancelAnimationFrame(this.rafId);
    }
}

// ============================================================
// [RENDER & FILTER]
// ============================================================
function renderMarquee(trackId, dataList, speed) {
    const container = document.getElementById(trackId);
    if (!container) return;
    container.innerHTML = "";
    
    if (dataList.length === 0) return;

    // 데이터 증식 (무한 스크롤용 3배수 복사)
    let filledList = [...dataList];
    while (filledList.length < 30) { filledList = filledList.concat(dataList); }
    filledList = filledList.concat(filledList).concat(filledList);

    let htmlCode = "";
    filledList.forEach(item => {
        htmlCode += `
            <div class="box-container">
                <div class="box-base" style="background-color: ${item.color};">
                    ${item.bigText}
                </div>
                <div class="box-overlay">
                    <span class="overlay-text">${item.type}</span>
                </div>
                <div class="caption-box">
                    <div class="title-text">${item.title}</div>
                    <div class="desc-text">${item.desc}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = htmlCode;

    // 물리 엔진 장착
    const marquee = new InertiaMarquee(container, speed);
    animations.push(marquee);
}

function filterBy(filterType) {
    // 기존 애니메이션 클리어
    animations.forEach(anim => anim.destroy());
    animations = [];

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if(btn.innerText === filterType) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const label = document.getElementById('current-filter-label');
    if(label) label.innerText = (filterType === 'All') ? "All Projects" : filterType;

    let f1, f2, f3;
    if (filterType === 'All') {
        f1 = row1_data; f2 = row2_data; f3 = row3_data;
    } else {
        f1 = row1_data.filter(item => item.type === filterType);
        f2 = row2_data.filter(item => item.type === filterType);
        f3 = row3_data.filter(item => item.type === filterType);
    }

    // 속도 설정 (숫자가 클수록 빠름. 0.5~0.8 추천)
    renderMarquee('track-1', f1, 0.6); 
    renderMarquee('track-2', f2, 0.7); 
    renderMarquee('track-3', f3, 0.5); 
}

// 시작
filterBy('All');
