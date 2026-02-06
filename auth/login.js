import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusBox = document.getElementById("status");

function show(msg) {
  statusBox.textContent = msg;
}

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    show("❌ 이메일과 비밀번호를 입력하세요.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    show("✅ 회원가입 성공! 이제 로그인하세요.");
  } catch (e) {
    show("❌ " + e.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    show("❌ 이메일과 비밀번호를 입력하세요.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    show("✅ 로그인 성공! 이동합니다...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  } catch (e) {
    show("❌ 로그인 실패: " + e.message);
  }
});
