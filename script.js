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

// 실제 프로젝트 데이터
const row3_data = [
    { 
        title: "을지로 기하 수집 한옥화", 
        desc: "기하수집 한옥화 / 2025", 
        color: "#466236", 
        type: "Scale",
        insta_prefix: "DO0-EL-gRQ4",
        img_count: 2,
        img_folder: "web_prjs/web_prjs_scale/2025y_09_기하수집한옥화",
    },
    { 
        title: "마을 그리드", 
        desc: "기하수집 한옥화 / 2025", 
        color: "#466236", 
        type: "Scale",
        insta_prefix: "DPtV_nkE44U",
        img_count: 9,
        img_folder: "web_prjs/web_prjs_scale/2025y_10_마을그리드",
    },
    { 
        title: "귀한대 집공", 
        desc: "기하수집 한옥화 / 2025", 
        color: "#466236", 
        type: "Scale",
        insta_prefix: "DPUCk9-Abfw",
        img_count: 9,
        img_folder: "web_prjs/web_prjs_scale/2025y_10_귀한대집공",
    },
    { 
        title: "을지피막도", 
        desc: "기하수집 한옥화 / 2025", 
        color: "#466236", 
        type: "Scale",
        insta_prefix: "DPdq18aAa9a",
        img_count: 8,
        img_folder: "web_prjs/web_prjs_scale/2025y_10_을지피막도",
    },
];

// row1_data와 row2_data는 아직 더미 데이터입니다.
// 나중에 실제 프로젝트로 교체하세요.

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

        // 로딩 후 길이 계산 및 초기 위치 설정
        setTimeout(() => {
            if (this.el.children.length > 0) {
                // 5배수 복사했으므로 전체의 1/5이 1세트 길이
                this.totalWidth = this.el.scrollWidth / 5;
                // 초기 위치를 중간 지점(2번째 세트 시작)으로 설정 - 양쪽으로 스크롤 가능
                this.currentPos = -this.totalWidth * 2;
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

        // 4. 무한 스크롤 텔레포트 (Loop) - 눈에 띄지 않게 개선
        if (this.totalWidth > 0) {
            // 5배 복사: [세트1, 세트2, 세트3, 세트4, 세트5]
            // 초기 위치: 세트3 시작 (-totalWidth * 2)
            // 왼쪽 끝 도달 (세트5를 지나면) -> 세트3 시작으로 텔레포트
            if (this.currentPos < -this.totalWidth * 4) {
                this.currentPos += this.totalWidth * 2;
            }
            // 오른쪽 끝 도달 (세트1을 지나면) -> 세트3 시작으로 텔레포트
            else if (this.currentPos > 0) {
                this.currentPos -= this.totalWidth * 2;
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

    // 데이터 증식 (무한 스크롤용 5배수 복사 - 텔레포트가 눈에 띄지 않게)
    let filledList = [...dataList];
    while (filledList.length < 30) { filledList = filledList.concat(dataList); }
    // 5배 복사: [A, B, C] -> [A, B, C, A, B, C, A, B, C, A, B, C, A, B, C]
    filledList = filledList.concat(filledList).concat(filledList).concat(filledList).concat(filledList);

    let htmlCode = "";
    filledList.forEach((item, index) => {
        // 이미지가 있는 프로젝트인지 확인
        let boxContent = "";
        if (item.insta_prefix && item.img_count && item.img_folder) {
            // 여러 이미지가 있는 프로젝트: 인덱스에 따라 다른 이미지 표시 (겹침 방지)
            // 썸네일은 1~min(3, img_count)번 이미지 순환
            const maxThumb = Math.min(3, item.img_count);
            const imgNum = (index % maxThumb) + 1;
            const imgPath = encodeURI(`${item.img_folder}/${item.insta_prefix}_${imgNum}.jpg`);
            boxContent = `
                <div class="box-base" style="background-image: url('${imgPath}'); background-size: cover; background-position: center;">
                </div>
            `;
        } else if (item.thumbnail) {
            // 단일 썸네일 이미지가 지정된 경우
            boxContent = `
                <div class="box-base" style="background-image: url('${item.thumbnail}'); background-size: cover; background-position: center;">
                </div>
            `;
        } else {
            // 이미지 없으면 기존처럼 색상 배경
            boxContent = `
                <div class="box-base" style="background-color: ${item.color};">
                    ${item.bigText || ''}
                </div>
            `;
        }
        
        // 프로젝트 데이터를 data 속성에 저장
        const projectData = JSON.stringify(item).replace(/"/g, '&quot;');
        htmlCode += `
            <div class="box-container" data-project='${projectData}'>
                ${boxContent}
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

    // 프로젝트 박스 클릭 이벤트 추가
    let clickStartX = 0;
    let clickStartY = 0;
    let hasMoved = false;
    
    container.querySelectorAll('.box-container').forEach(box => {
        box.addEventListener('mousedown', function(e) {
            clickStartX = e.clientX;
            clickStartY = e.clientY;
            hasMoved = false;
        });
        
        box.addEventListener('mousemove', function(e) {
            if (Math.abs(e.clientX - clickStartX) > 5 || Math.abs(e.clientY - clickStartY) > 5) {
                hasMoved = true;
            }
        });
        
        box.addEventListener('click', function(e) {
            // 드래그했으면 클릭 무시
            if (hasMoved) {
                hasMoved = false;
                return;
            }
            const projectData = JSON.parse(this.getAttribute('data-project'));
            openProjectModal(projectData);
        });
    });

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

// ============================================================
// [ABOUT MODAL] About Us 모달
// ============================================================
function openAboutModal() {
    const modal = document.getElementById('project-modal');
    const detailContainer = document.getElementById('project-detail');
    
    // About 모달용 클래스 추가 (3단 레이아웃 비활성화)
    detailContainer.classList.add('about-mode');
    
    const aboutHtml = `
        <div class="about-content">
            <!-- 스튜디오 헤더 -->
            <div class="about-header">
                <h1 class="studio-name">미신스</h1>
                <p class="studio-name-en">(Mesynx)</p>
            </div>
            
            <!-- Statement -->
            <div class="about-statement">
                <h2>Statement</h2>
                <div class="statement-body">
                    <p><strong>미신스</strong>는 건축적 논리와 공예적 물성을 엮어 보이지 않는 믿음의 형상을 직조한다.</p>
                    
                    <p><strong>이혁영</strong>은 디지털 언어와 알고리즘으로 무형의 구문(syntax)을 설계·구현하고, <strong>이예원</strong>은 재료의 물성을 직접 다루며 축조적 상상을 탐구·실현한다. 두 과정은 서로 작용하여 차가운 데이터에 흐흠을, 뜨거운 봄꽃에 구조를 부여한다. 이 과정에서 3D 프린트·용접·적층(media)은 수단이 되어, 설계의 치밀함과 물질의 거칠음이 맞물리는 하나의 제작 생태계를 이룬다.</p>
                    
                    <p>우리가 탐구하는 구조적 미학은 기술·공예·전통이 하나의 장치 안에서 동화되는 순간에 발현된다. 이성적인 그리드 위에 사대부의 절제된 정신을 입히고, 건조한 도면에 시간의 두께를 겹쳐 손으로 감지되는 실재를 만든다. 시스템을 설계하는 손은 재료의 저항에 유연해지고, 물성을 다루는 손은 구조의 엄정함으로 단단해진다. 우리는 거대한 도시 조직을 손바닥 크기로 압축하거나, 미시적 공예의 결을 공간 전체로 확장하며 무척도 데이터가 중력의 설득력을 얻는 적도(scale)를 연출한다.</p>
                    
                    <p>우리는 전통과 미래를 수직적으로 병치하지 않는다. 조선 여차탑의 위게, 비색이 품은 담청의 깊이 같은 정신적 문법을 현대적 시스템으로 재구조화해 수평적으로 변환한다. 그 결과물은 낡은 기념비도, 일회적 프로토타입도 아닌 '믿음의 토템'—제작 시간과 물리적 무게가 증명하는 실재의 덩어리다.</p>
                    
                    <p>미신스(medium,syntax,scale)에게 구축은 기술 시대가 갈망하는 깊이를 도시에 삽입하는 의례다. 구문·매체·적도는 이 의례를 위한 추진체이며, 충돌과 동화의 반복 속에서 제3의 풍경이 솟는다. 언어를 넘어 신체로 감지되는 밀도, 그것이 우리가 지향하는 실재의 형상이다.</p>
                    
                    <p class="statement-year">2025</p>
                </div>
            </div>
            
            <!-- Artists -->
            <div class="about-artists">
                <h2>Artists</h2>
                
                <div class="artists-grid">
                    <!-- 이혁영 -->
                    <div class="artist-card">
                        <h3>이혁영 <span class="artist-name-en">Hyeok Young Lee</span></h3>
                        <p class="artist-role">Architectural Designer / Computational Worker</p>
                        <div class="artist-info">
                            <p class="artist-contact">
                                <a href="mailto:483lhy@gmail.com">483lhy@gmail.com</a><br>
                                <a href="https://instagram.com/lhy_design" target="_blank">@lhy_design</a>
                            </p>
                        </div>
                        <div class="artist-education">
                            <h4>Education</h4>
                            <p>Columbia University in the City of New York<br>
                            <span class="degree">M.S. Advanced Architectural Design</span></p>
                        </div>
                        <div class="artist-education">
                            <h4>Community</h4>
                            <p>AI Odyssey<br>
                            <span class="degree">Generative AI Community Leader, 11k Followers</span></p>
                        </div>
                    </div>
                    
                    <!-- 이예원 -->
                    <div class="artist-card">
                        <h3>이예원 <span class="artist-name-en">Ye Won Lee</span></h3>
                        <p class="artist-role">Space Designer / Maker</p>
                        <div class="artist-info">
                            <p class="artist-contact">
                                <a href="mailto:yewonleestudio@gmail.com">yewonleestudio@gmail.com</a><br>
                                <a href="https://instagram.com/yewonleei" target="_blank">@yewonleei</a>
                            </p>
                        </div>
                        <div class="artist-education">
                            <h4>Education</h4>
                            <p>이화여자대학교 Ewha Womans University<br>
                            <span class="degree">B.Arch. Architecture</span></p>
                        </div>
                        <div class="artist-education">
                            <h4>Awards</h4>
                            <p>SDF 영디자이너 선정<br>
                            <span class="degree">서울 디자인 페스티벌, 2024</span></p>
                            <p>파리 메종오브제 진출권 수상<br>
                            <span class="degree">꼼따블르데코피아 1등, 2024</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Exhibition Record -->
            <div class="about-exhibitions">
                <h2>Exhibition Record</h2>
                <div class="exhibition-list">
                    <div class="exhibition-year">
                        <span class="year">2025</span>
                        <div class="exhibitions">
                            <p>≪Radically More Human≫ 제5회 서울 도시 건축 비엔날레 주제전 ≪Facade-ish Lab(-or)s≫  | 서울 송현광장</p>
                            <p>≪을지 기하수집 한옥화≫ 개인전. 서울시 주관 | 서울 통의동 마을마당</p>
                            <p>≪太古로부터;小女≫ 2인전 | 서울 부암동</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2024</span>
                        <div class="exhibitions">
                            <p>≪사대부 모더니즘 II≫ 개인부스. 디자인하우스 주관 | 서울 코엑스</p>
                            <p>≪東洋 新美學≫ Young Designer Promotion | 서울 코엑스</p>
                            <p>≪해안 Pavilion≫ 대한민국 건축산업대전 | 서울 코엑스</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2023</span>
                        <div class="exhibitions">
                            <p>≪사대부 모더니즘≫ 개인부스. 더 메종 주관 | 서울 코엑스</p>
                            <p>≪To the Medium, Drive≫ 미디어월. 샌드박스 주관 | 서울 라이트룸</p>
                            <p>≪NEXT CREATORS≫ 선정 기획 전시 | Home Table & Deco Fair, 코엑스</p>
                            <p>≪산수인물의 도시≫ 한국-스위스 수교 60주년 기념 교류 전시 | 서울 도시건축 전시관</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2022</span>
                        <div class="exhibitions">
                            <p>≪Primitive, Plastic hut≫ Climate-Crisis Installation. 어반브레이크 | 서울 코엑스</p>
                            <p>≪To the medium; line≫ Media-Wall. 어반브레이크 | 서울 코엑스</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2021</span>
                        <div class="exhibitions">
                            <p>≪ON&OFF≫ 서울 건축문화제 UAUS | 노들섬</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Professional Experience -->
            <div class="about-exhibitions">
                <h2>Professional Experience</h2>
                <div class="exhibition-list">
                    <div class="exhibition-year">
                        <span class="year">2021-2025</span>
                        <div class="exhibitions">
                            <p class="project-parent">해안 건축사사무소 | H Studio SI — Junior Architect</p>
                            <p class="project-subitem">강북구청 | Gangbuk District Office</p>
                            <p class="project-subitem">VIP단독주택 | VIP Private Residence</p>
                            <p class="project-subitem">한화갤러리아 사옥 | Hanwha Galleria HQ</p>
                            <p class="project-separator">GENESIS, Black 시리즈 — 공간 설치 기획 및 자문</p>
                            <p>JIMINLEE 24FW 플래그십 스토어 — 인테리어 및 공간 설치</p>
                            <p>OVIVOS / Africa 아이웨어 편집샵 — 인테리어 및 브랜딩</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">~2022</span>
                        <div class="exhibitions">
                            <p>문화재 수리관리 통합 DB BIM — 예산 수덕사 등 4개소 및 복원연구. 한양대학교 전한종 교수</p>
                            <p>석굴암 복원 연구 — 이화여자대학교 윤재신 명예교수</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Lectures -->
            <div class="about-exhibitions">
                <h2>Lectures</h2>
                <div class="exhibition-list">
                    <div class="exhibition-year">
                        <span class="year">2024</span>
                        <div class="exhibitions">
                            <p>≪Generative AI, as a Medium≫ 이화여자대학교 | Prof. J. Lee</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2023</span>
                        <div class="exhibitions">
                            <p>≪Designers vs Generative AI≫ 한양대학교 | Prof. JK Kim</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2020-2021</span>
                        <div class="exhibitions">
                            <p>한양대학교 — Visiting Researcher | Studio Tutor</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Artworks -->
            <div class="about-exhibitions">
                <h2>Artworks</h2>
                <div class="exhibition-list">
                    <div class="exhibition-year">
                        <span class="year">2024</span>
                        <div class="exhibitions">
                            <p>≪백수백복 百壽百福≫ 001, 002, 003 | Yearnings Series, Art Furniture</p>
                            <p>≪공포 栱包/恐怖≫ 001 | Fears Series, Sculpture/Installation</p>
                        </div>
                    </div>
                    <div class="exhibition-year">
                        <span class="year">2023</span>
                        <div class="exhibitions">
                            <p>≪책가도장≫ Guardians Nong | Art Furniture, Walza 공동제작</p>
                            <p>≪수호농≫ Chaeg-ga-do Jang | Art Furniture, Walza 공동제작</p>
                            <p>≪가벽선농≫ | Art Furniture, Walza 공동제작</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    detailContainer.innerHTML = aboutHtml;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================================
// [PROJECT MODAL] 프로젝트 상세 모달
// ============================================================

// 모달 열기
function openProjectModal(projectData) {
    const modal = document.getElementById('project-modal');
    const detailContainer = document.getElementById('project-detail');
    
    // 프로젝트 정보 로드
    loadProjectDetail(projectData).then(html => {
        detailContainer.innerHTML = html;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// 모달 닫기
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const detailContainer = document.getElementById('project-detail');
    modal.classList.remove('active');
    detailContainer.classList.remove('about-mode');
    document.body.style.overflow = '';
}

// ESC 키로 모달/라이트박스 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // 라이트박스가 열려있으면 먼저 닫기
        const lightbox = document.getElementById('image-lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
            return;
        }
        // 프로젝트 모달 닫기
        closeProjectModal();
    }
});

// 프로젝트 상세 정보 로드
async function loadProjectDetail(projectData) {
    let html = '';
    let metaInfo = '';
    let leftSidebar = '';
    let rightSidebar = '';
    let mainContent = '';
    
    // 제목 영역
    mainContent += `<div class="project-caption">${projectData.desc || ''}</div>`;
    mainContent += `<h1>${projectData.title}</h1>`;
    
    // info.txt 파일이 있으면 로드
    if (projectData.insta_prefix && projectData.img_folder) {
        try {
            const infoPath = encodeURI(`${projectData.img_folder}/${projectData.insta_prefix}_info.txt`);
            const response = await fetch(infoPath);
            if (response.ok) {
                const text = await response.text();
                const info = parseInfoFile(text);
                
                // 메타 정보 (인라인 - 세로 화면용)
                if (info.date || info.author || info.likes) {
                    metaInfo += `<div class="project-meta">`;
                    if (info.date) metaInfo += `<span class="meta-item"><strong>Date</strong> ${info.date.split(' ')[0]}</span>`;
                    if (info.author) metaInfo += `<span class="meta-item"><strong>Author</strong> ${info.author}</span>`;
                    if (info.likes) metaInfo += `<span class="meta-item"><strong>Likes</strong> ${info.likes}</span>`;
                    metaInfo += `</div>`;
                }
                
                // 왼쪽 사이드바 (가로 화면용)
                if (info.date || info.author || info.likes) {
                    leftSidebar += `<div class="project-sidebar-left">`;
                    if (info.date) {
                        leftSidebar += `<div class="sidebar-section"><div class="sidebar-title">Date</div><div class="sidebar-content">${info.date.split(' ')[0]}</div></div>`;
                    }
                    if (info.author) {
                        leftSidebar += `<div class="sidebar-section"><div class="sidebar-title">Author</div><div class="sidebar-content">${info.author}</div></div>`;
                    }
                    if (info.likes) {
                        leftSidebar += `<div class="sidebar-section"><div class="sidebar-title">Likes</div><div class="sidebar-content">${info.likes}</div></div>`;
                    }
                    leftSidebar += `</div>`;
                }
                
                // 오른쪽 사이드바: 목차 (가로 화면용)
                rightSidebar += `<div class="project-sidebar-right">`;
                rightSidebar += `<div class="sidebar-section"><div class="sidebar-title">Contents</div>`;
                rightSidebar += `<ul class="sidebar-list">`;
                rightSidebar += `<li>${projectData.title}</li>`;
                if (info.artists) rightSidebar += `<li>Artists</li>`;
                if (info.photo) rightSidebar += `<li>Photo Credits</li>`;
                rightSidebar += `</ul></div></div>`;
                
                // 본문 텍스트
                if (info.body) {
                    mainContent += `<div class="project-body">${formatText(info.body)}</div>`;
                }
                
                // 이미지 갤러리
                if (projectData.img_count) {
                    mainContent += createGallery(projectData, info);
                }
                
                // 추가 본문 (이미지 후)
                if (info.bodyAfter) {
                    mainContent += `<div class="project-body">${formatText(info.bodyAfter)}</div>`;
                }
                
                // 크레딧 (인스타그램 링크 적용)
                if (info.artists || info.assists || info.photo) {
                    mainContent += `<div class="project-body" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">`;
                    if (info.artists) mainContent += `<p><strong>Artists:</strong> ${linkifyInstagram(info.artists)}</p>`;
                    if (info.assists) mainContent += `<p><strong>Assists:</strong> ${linkifyInstagram(info.assists)}</p>`;
                    if (info.photo) mainContent += `<p><strong>Photo:</strong> ${linkifyInstagram(info.photo)}</p>`;
                    mainContent += `</div>`;
                }
            } else {
                // info.txt 없으면 기본 레이아웃
                mainContent += `<div class="project-body">${projectData.desc || ''}</div>`;
                mainContent += createGallery(projectData);
            }
        } catch (error) {
            console.error('Error loading project info:', error);
            mainContent += `<div class="project-body">${projectData.desc || ''}</div>`;
            mainContent += createGallery(projectData);
        }
    } else {
        // 더미 프로젝트
        mainContent += `<div class="project-body">${projectData.desc || '프로젝트 설명이 없습니다.'}</div>`;
    }
    
    // 레이아웃 조립: 사이드바 + 메타 정보 + 본문
    // CSS가 화면 비율에 따라 어떤 것을 보여줄지 결정
    html += leftSidebar;  // 가로 화면에서만 표시
    html += metaInfo;     // 세로 화면에서만 표시
    html += mainContent;
    html += rightSidebar; // 가로 화면에서만 표시
    
    return html;
}

// info.txt 파일 파싱
function parseInfoFile(text) {
    const lines = text.split('\n');
    const info = {
        date: '',
        author: '',
        likes: '',
        body: '',
        bodyAfter: '',
        artists: '',
        assists: '',
        photo: ''
    };
    
    let currentSection = 'body';
    let bodyLines = [];
    let bodyAfterLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 댓글 관련 불필요한 문구 건너뛰기
        if (line.startsWith('>>') || line.includes('Login required')) {
            continue;
        }
        
        if (line.startsWith('날짜:')) {
            info.date = line.replace('날짜:', '').trim();
        } else if (line.startsWith('작성자:')) {
            info.author = line.replace('작성자:', '').trim();
        } else if (line.startsWith('좋아요:')) {
            info.likes = line.replace('좋아요:', '').trim();
        } else if (line === '[본문]') {
            currentSection = 'body';
        } else if (line === '[댓글]') {
            currentSection = 'comment';
        } else if (line.startsWith('Artists:')) {
            info.artists = line.replace('Artists:', '').trim();
        } else if (line.startsWith('Assists:')) {
            info.assists = line.replace('Assists:', '').trim();
        } else if (line.startsWith('Photo:')) {
            info.photo = line.replace('Photo:', '').trim();
        } else if (line.startsWith('Ps.')) {
            bodyAfterLines.push(line);
        } else if (currentSection === 'body' && line && !line.startsWith('---')) {
            bodyLines.push(line);
        }
        // 댓글 섹션은 더 이상 bodyAfterLines에 추가하지 않음
    }
    
    info.body = bodyLines.join('\n\n');
    info.bodyAfter = bodyAfterLines.join('\n\n');
    
    return info;
}

// 텍스트 포맷팅 (줄바꿈, 링크 등)
function formatText(text) {
    if (!text) return '';
    
    // 줄바꿈을 <br>로 변환
    let formatted = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    
    // @로 시작하는 인스타그램 링크 변환 (점, 밑줄, 숫자 포함)
    formatted = linkifyInstagram(formatted);
    
    return `<p>${formatted}</p>`;
}

// @username을 인스타그램 링크로 변환
function linkifyInstagram(text) {
    if (!text) return '';
    // 인스타그램 사용자명: 영문자, 숫자, 점(.), 밑줄(_) 허용
    return text.replace(/@([\w.]+)/g, '<a href="https://instagram.com/$1" target="_blank" style="color: inherit;">@$1</a>');
}

// 갤러리 생성 (Cargo 스타일)
function createGallery(projectData, info = {}) {
    if (!projectData.img_count) return '';
    
    let html = '';
    const imgCount = Math.min(projectData.img_count, 9); // 최대 9장
    
    // 2열 그리드로 이미지 배치 (CSS에서 반응형 처리)
    html += '<div class="gallery-grid">';
    
    for (let i = 1; i <= imgCount; i++) {
        const imgPath = encodeURI(`${projectData.img_folder}/${projectData.insta_prefix}_${i}.jpg`);
        const caption = info.captions && info.captions[i] ? info.captions[i] : '';
        
        html += `
            <div class="media-item zoomable" onclick="openLightbox('${imgPath}')">
                <img src="${imgPath}" alt="${projectData.title} - Image ${i}" loading="lazy">
                ${caption ? `<div class="caption">${caption}</div>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    
    return html;
}

// ============================================================
// [IMAGE LIGHTBOX] 이미지 확대 모달
// ============================================================

// 라이트박스 열기
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    
    lightboxImg.src = imageSrc;
    lightbox.classList.add('active');
}

// 라이트박스 닫기
function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    lightbox.classList.remove('active');
}

