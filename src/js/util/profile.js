// profile.js — 사용자 간략 정보 계산 + 표시 (함께한 날, 프로젝트 수, 마지막 작업)


// 프로필 사진 업로드 기능
const input = document.getElementById('imageInput');
const avatar = document.querySelector(".profile-avatar");
const camera = document.querySelector(".camera");

input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = (e) => {
            avatar.src = e.target.result;
        }
    reader.readAsDataURL(file);
    }
}); 

