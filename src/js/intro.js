// intro.js — 소개 페이지: 휠을 내릴 때마다 장면을 한 단계씩 넘긴다

document.getElementById("brand").addEventListener("click", () => {
  location.href = "index.html";
});

const stage = document.querySelector("main");
const dots = document.querySelectorAll(".scene-dot");

// 단계 목록. scene: 몇 번째 장면인지 / time: 애니메이션이 끝날 때까지 기다릴 시간(ms)
// rest: true면 휠을 한 번 멈췄다가 다시 내려야 넘어간다 (계속 굴리고 있으면 멈춰 있음)
const steps = [
  { scene: 0, time: 0 },                    // 0. 소개
  { scene: 1, time: 1300, rest: true },     // 1. HTML은 어렵다
  { scene: 2, time: 1100, rest: true },     // 2. 가운데 여백을 확대하며 PART 1 시작
  { scene: 2, time: 800 },                  // 3. 태그 고르기
  { scene: 2, time: 2300 },                 // 4. 속성 적기 (class 클릭 → 입력 → 내용 클릭 → 입력)
  { scene: 2, time: 1200 },                 // 5. 제작 → 블록
  { scene: 2, time: 3300 },                 // 6. PART 2 렌더링부에 차례로 배치 → 코드부가 빠지며 가상 페이지
  { scene: 3, time: 2800, rest: true },     // 7. 기타 기능 소개
  { scene: 4, time: 3200, rest: true },     // 8. 마무리: 문구가 차례로 자동 등장
];

let current = 0;
let busyUntil = 0;
let lastWheel = 0;

// index 단계로 이동. main에 s1 ~ s(index) 클래스를 붙여서 CSS가 장면을 바꾼다
function goTo(index) {
  if (index < 0 || index >= steps.length) return;

  const forward = index > current;
  current = index;

  for (let i = 1; i < steps.length; i++) {
    stage.classList.toggle("s" + i, i <= current);
  }

  dots.forEach((dot, i) => {
    dot.classList.toggle("is-current", i === steps[current].scene);
  });

  if (steps[current].scene !== 3) dock(-1);

  busyUntil = Date.now() + (forward ? steps[current].time : 900);
}

// 기능 소개: macOS 독처럼 마우스가 다가간 기능은 커지고, 나머지는 작아지며 순서대로 양옆으로 밀려난다
const toolbar = document.querySelector(".mock-toolbar");
const features = document.querySelectorAll(".feature");
const homeX = [-22.5, -7.5, 7.5, 22.5]; // 기능 4개의 원래 가로 위치 (rem, 가운데가 0)
const columnWidth = 15;                 // 기능 한 칸 너비 (rem)
const leaveMargin = 2.5;                // 카드에서 이만큼(rem) 더 벗어나야 다음 기능으로 넘어간다
const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
let focused = -1;

// index번째 기능을 크게 보여준다. -1이면 4개 모두 원래 크기로
function dock(index) {
  if (index === focused) return;
  focused = index;

  const scales = homeX.map((x, i) => {
    if (index < 0) return 1;
    return i === index ? 1.3 : 0.82;
  });

  // 바뀐 칸 너비를 더해서 다시 줄 세운다. 왼쪽 기능은 왼쪽에, 오른쪽 기능은 오른쪽에 남는다
  const total = scales.reduce((sum, scale) => sum + columnWidth * scale, 0);
  let left = -total / 2;

  features.forEach((feature, i) => {
    const width = columnWidth * scales[i];
    const center = left + width / 2;
    left += width;

    feature.style.translate = index < 0 ? "" : (center - homeX[i]) + "rem 0";
    feature.style.scale = index < 0 ? "" : scales[i];
    feature.classList.toggle("is-active", i === index);
  });

  toolbar.classList.toggle("is-docking", index >= 0);
}

window.addEventListener("mousemove", (event) => {
  if (steps[current].scene !== 3) return;

  const row = toolbar.getBoundingClientRect();
  const centerX = row.left + row.width / 2;
  const near =
    event.clientY > row.top - 4 * remPx &&
    event.clientY < row.bottom + 20 * remPx &&
    Math.abs(event.clientX - centerX) < 36 * remPx;

  if (!near) {
    dock(-1);
    return;
  }

  // 지금 커진 카드 근처에 있으면 그대로 둔다 (마우스를 조금 움직일 때마다 바뀌지 않게)
  const x = (event.clientX - centerX) / remPx;
  if (focused >= 0 && Math.abs(x - homeX[focused]) < columnWidth / 2 + leaveMargin) return;

  let nearest = 0;
  homeX.forEach((home, i) => {
    if (Math.abs(x - home) < Math.abs(x - homeX[nearest])) nearest = i;
  });
  dock(nearest);
});

// 다음(1) 또는 이전(-1) 단계로. rested는 휠을 잠깐 멈췄다가 다시 굴렸는지
function move(direction, rested) {
  if (Date.now() < busyUntil) return;

  const next = current + direction;
  if (next < 0 || next >= steps.length) return;

  const checkStep = direction > 0 ? steps[next] : steps[current];
  if (checkStep.rest && !rested) return;

  goTo(next);
}

window.addEventListener("wheel", (event) => {
  event.preventDefault();

  const now = Date.now();
  const rested = now - lastWheel > 300;
  lastWheel = now;

  if (event.deltaY > 0) move(1, rested);
  if (event.deltaY < 0) move(-1, rested);
}, { passive: false });

window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    move(1, true);
  }
  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    move(-1, true);
  }
});

let touchStartY = 0;

window.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0].clientY;
});

window.addEventListener("touchend", (event) => {
  const distance = touchStartY - event.changedTouches[0].clientY;
  if (distance > 50) move(1, true);
  if (distance < -50) move(-1, true);
});

document.querySelector(".hero-scroll").addEventListener("click", (event) => {
  event.preventDefault();
  move(1, true);
});
