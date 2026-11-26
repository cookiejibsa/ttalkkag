// splitter.js — 렌더링부/코드부 구분선 리사이즈 로직
const splitter = document.querySelector(".splitter");
const container = splitter?.parentElement;
const pane1 = document.querySelector(".render-pane");
const pane2 = document.querySelector(".code-pane");

// 필요한 요소가 모두 있을 때만 이벤트를 등록.
if (splitter && container && pane1 && pane2) {
  splitter.addEventListener("pointerdown", (e) => {
    // 마우스 상태 및 글자 입력 방지
    if (e.button !== 0) return; 
    splitter.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
  });

  // 누른 채 움직일 때 좌우 패널의 너비를 갱신.
  splitter.addEventListener("pointermove", (e) => {
    // 현재 드래그 중인 포인터의 움직임인지 확인.
    if (!splitter.hasPointerCapture(e.pointerId)) return;

    const rect = container.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const pane1Percent = Math.max(15, Math.min(85, ratio * 100));
    const pane2Percent = 100 - pane1Percent;
    const halfSplitter = splitter.offsetWidth / 2;

    // 폭 설정
    pane1.style.width = `calc(${pane1Percent}% - ${halfSplitter}px)`;
    pane2.style.width = `calc(${pane2Percent}% - ${halfSplitter}px)`;
  });

  // 마우스를 놓거나 입력이 취소되면 드래그 상태 정리.
  const stopResize = (e) => {
    if (splitter.hasPointerCapture(e.pointerId)) {
      splitter.releasePointerCapture(e.pointerId);
    }
    document.body.style.userSelect = "";
  };

  splitter.addEventListener("pointerup", stopResize);
  splitter.addEventListener("pointercancel", stopResize);
}