import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const $ = (sel) => document.querySelector(sel);

function setBusy(isBusy) {
  const btn = $("#doSignupBtn");
  if (!btn) return;
  btn.disabled = isBusy;
  btn.style.opacity = isBusy ? "0.65" : "1";
}

function norm(v) {
  return (v || "").trim();
}

async function emailSignup() {
  const name = norm($("#name")?.value);
  const church = norm($("#church")?.value);
  const email = norm($("#email")?.value);
  const pw = $("#password")?.value || "";
  const pw2 = $("#password2")?.value || "";

  if (!church) {
    alert("소속 교회(필수)를 입력해 주세요.");
    $("#church")?.focus();
    return;
  }
  if (!email) {
    alert("이메일을 입력해 주세요.");
    $("#email")?.focus();
    return;
  }
  if (pw.length < 8) {
    alert("비밀번호는 8자 이상으로 입력해 주세요.");
    $("#password")?.focus();
    return;
  }
  if (pw !== pw2) {
    alert("비밀번호 확인이 일치하지 않습니다.");
    $("#password2")?.focus();
    return;
  }

  setBusy(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);

    if (name) {
      try { await updateProfile(cred.user, { displayName: name }); } catch (_) {}
    }

    // (선택) 간단 프로필 임시 저장 — 나중에 Firestore로 교체 가능
    localStorage.setItem("still_profile", JSON.stringify({
      uid: cred.user.uid,
      name: name || "",
      church,
      email,
      createdAt: Date.now(),
      provider: "password"
    }));

    // 가입 성공 → 로그인 페이지로 이동 (email 자동 채움)
    window.location.href = `login.html?email=${encodeURIComponent(email)}`;
  } catch (err) {
    console.error(err);
    const msg =
      err?.code === "auth/email-already-in-use" ? "이미 사용 중인 이메일입니다." :
      err?.code === "auth/invalid-email" ? "이메일 형식이 올바르지 않습니다." :
      err?.code === "auth/weak-password" ? "비밀번호가 너무 약합니다. 8자 이상으로 설정해 주세요." :
      "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    alert(msg);
  } finally {
    setBusy(false);
  }
}

async function googleSignup() {
  setBusy(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const email = result.user?.email || "";
    localStorage.setItem("still_profile", JSON.stringify({
      uid: result.user.uid,
      name: result.user.displayName || "",
      church: "",
      email,
      createdAt: Date.now(),
      provider: "google"
    }));

    // 원하면 index.html로 바로 보내도 됨. 지금은 요청대로 login.html로.
    window.location.href = email
      ? `login.html?email=${encodeURIComponent(email)}`
      : "login.html";
  } catch (err) {
    console.error(err);
    const msg =
      err?.code === "auth/popup-closed-by-user" ? "팝업이 닫혔습니다." :
      "Google 로그인에 실패했습니다.";
    alert(msg);
  } finally {
    setBusy(false);
  }
}

$("#doSignupBtn")?.addEventListener("click", emailSignup);
$("#googleBtn")?.addEventListener("click", googleSignup);

// Enter 키로 가입
["#name", "#church", "#email", "#password", "#password2"].forEach((sel) => {
  $(sel)?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") emailSignup();
  });
});
