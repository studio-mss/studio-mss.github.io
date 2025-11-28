/* script.js */

// [DATABASE]
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

// 전역 변수로 관리 (필터링 시 기존 애니메이션 취소용)
let animations = [];

// [RENDER ENGINE]
function renderMarquee(trackId, dataList, speed) {
    const container = document.getElementById(trackId);
    if (!container) return;

    // 초기화
    container.innerHTML = "";
    
    // 데이터 없으면 종료
    if (dataList.length === 0) return;

    // 1. 데이터 증식 (무한 스크롤 및 드래그를 위해 충분히 길게 복사)
    let filledList = [...dataList];
    while (filledList.length < 20) { filledList = filledList.concat(dataList); }
    // 드래그를 위해 앞뒤로 넉넉하게 3배수로 만듦
    filledList = filledList.concat(filledList).concat(filledList);

    // 2. HTML 생성
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

    // 3. 드래그 & 스크롤 로직 적용 (Class 인스턴스 생성)
    const marquee = new DraggableMarquee(container, speed);
    animations.push(marquee);
}

// [PHYSICS ENGINE] 드래그 및 애니메이션 처리 클래스
class DraggableMarquee {
    constructor(element, baseSpeed) {
        this.el = element;
        this.baseSpeed = baseSpeed; // 기본 속도 (양수: 왼쪽이동)
        this.currentPos = 0;
        this.isDragging = false;
        this.startX = 0;
        this.lastX = 0;
        this.rafId = null;
        this.isHovered = false;

        // 전체 길이 계산 (한 세트의 길이)
        // 로딩 타이밍 이슈 방지를 위해 잠시 대기 후 계산
        setTimeout(() => {
            this.totalWidth = this.el.scrollWidth / 3; // 3배수 했으므로 1/3이 원본 길이
        }, 100);

        this.initEvents();
        this.animate();
    }

    initEvents() {
        // 마우스 호버 시 멈춤 (드래그 중이 아닐 때만)
        this.el.addEventListener('mouseenter', () => { this.isHovered = true; });
        this.el.addEventListener('mouseleave', () => { 
            this.isHovered = false; 
            this.isDragging = false; // 밖으로 나가면 드래그 해제
        });

        // 드래그 시작 (PC)
        this.el.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.pageX;
            this.lastX = this.currentPos;
            this.el.style.cursor = 'grabbing';
        });

        // 드래그 이동 (PC)
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const diff = e.pageX - this.startX; // 이동 거리
            this.currentPos = this.lastX + diff; // 위치 업데이트
        });

        // 드래그 종료 (PC)
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            if(this.el) this.el.style.cursor = 'grab';
        });

        // 모바일 터치 지원
        this.el.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.startX = e.touches[0].pageX;
            this.lastX = this.currentPos;
        });
        this.el.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const diff = e.touches[0].pageX - this.startX;
            this.currentPos = this.lastX + diff;
        });
        this.el.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    animate() {
        // 드래그 중이 아니면 계속 흐름
        if (!this.isDragging && !this.isHovered) {
            this.currentPos -= this.baseSpeed;
        }

        // 무한 루프 로직 (텔레포트)
        if (this.totalWidth) {
            // 너무 왼쪽으로 갔으면 원점 복귀
            if (this.currentPos <= -this.totalWidth) {
                this.currentPos += this.totalWidth;
            }
            // 너무 오른쪽으로 갔으면(거꾸로 드래그) 끝으로 복귀
            if (this.currentPos > 0) {
                this.currentPos -= this.totalWidth;
            }
        }

        // 실제 이동 적용
        this.el.style.transform = `translateX(${this.currentPos}px)`;

        // 다음 프레임 요청
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    // 필터 변경 시 애니메이션 끄기용
    destroy() {
        cancelAnimationFrame(this.rafId);
    }
}

// [FILTER LOGIC]
function filterBy(filterType) {
    // 기존 애니메이션 모두 중단 (중복 실행 방지)
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

    // 렌더링 (속도 조절 가능: 숫자가 클수록 빠름. 0.5는 아주 느림)
    renderMarquee('track-1', f1, 0.5); 
    renderMarquee('track-2', f2, 0.6); // 약간 다르게
    renderMarquee('track-3', f3, 0.4); // 약간 다르게
}

// 초기 실행
filterBy('All');