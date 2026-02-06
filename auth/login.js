import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusBox = document.getElementById("status");
const nextUrl = new URLSearchParams(window.location.search).get("next") || "index.html";

function show(msg) {
  if (!statusBox) return;
  statusBox.textContent = msg;
}

document.getElementById("signupBtn")?.addEventListener("click", async () => {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    show("❌ 이메일과 비밀번호를 입력하세요.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    show("✅ 회원가입 성공! 이제 로그인하세요.");
  } catch (e) {
    show("❌ " + (e?.message || e));
  }
});

document.getElementById("formLoginBtn")?.addEventListener("click", async () => {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    show("❌ 이메일과 비밀번호를 입력하세요.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    show("✅ 로그인 성공! 이동합니다...");
    setTimeout(() => {
      window.location.href = nextUrl;
    }, 500);
  } catch (e) {
    show("❌ 로그인 실패: " + (e?.message || e));
  }
});

document.getElementById("googleBtn")?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    show("✅ Google 로그인 성공! 이동합니다...");
    setTimeout(() => {
      window.location.href = nextUrl;
    }, 500);
  } catch (e) {
    // common: auth/popup-closed-by-user, auth/operation-not-allowed, auth/unauthorized-domain
    show("❌ Google 로그인 실패: " + (e?.message || e));
  }
});
