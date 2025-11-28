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

// [ENGINE]
function renderMarquee(trackId, dataList) {
    const container = document.getElementById(trackId);
    if(!container) return;
    
    if(dataList.length === 0) { container.innerHTML = ""; return; }

    let filledList = [...dataList];
    while (filledList.length < 30) { filledList = filledList.concat(dataList); }
    filledList = filledList.concat(filledList);

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
}

function filterBy(filterType) {
    // 1. 버튼 활성화 스타일 변경
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if(btn.innerText === filterType) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // 2. [NEW] 왼쪽 소제목(Subtitle) 변경 기능
    const label = document.getElementById('current-filter-label');
    if (label) {
        if (filterType === 'All') label.innerText = "All Projects"; // 기본값
        else label.innerText = filterType; // 선택한 필터명 (Medium, Syntax...)
    }

    // 3. 데이터 필터링 및 렌더링
    let f1, f2, f3;
    if (filterType === 'All') {
        f1 = row1_data; f2 = row2_data; f3 = row3_data;
    } else {
        f1 = row1_data.filter(item => item.type === filterType);
        f2 = row2_data.filter(item => item.type === filterType);
        f3 = row3_data.filter(item => item.type === filterType);
    }
    renderMarquee('track-1', f1);
    renderMarquee('track-2', f2);
    renderMarquee('track-3', f3);
}

// 초기 실행
filterBy('All');
