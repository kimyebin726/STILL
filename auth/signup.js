import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const emailEl = $("email");
const pwEl = $("password");
const pw2El = $("password2");
const nameEl = $("displayName");
const churchEl = $("churchName");
const msgEl = $("msg");

const setMsg = (text, type = "") => {
  if (!msgEl) return;
  msgEl.textContent = text || "";
  msgEl.className = `msg ${type}`.trim();
};

const normalize = (v) => (v ?? "").toString().trim();

async function upsertUserDoc(user, extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      provider: (user.providerData?.[0]?.providerId) || "password",
      createdAt: serverTimestamp(),
      ...extra,
    });
  } else {
    // 이미 문서가 있으면 최소한 누락된 필드만 보완
    const current = snap.data() || {};
    const patch = {};
    if (!current.displayName && user.displayName) patch.displayName = user.displayName;
    if (!current.email && user.email) patch.email = user.email;
    if (Object.keys(extra).length) {
      for (const [k, v] of Object.entries(extra)) {
        if (v != null && v !== "" && !current[k]) patch[k] = v;
      }
    }
    if (Object.keys(patch).length) {
      await setDoc(ref, patch, { merge: true });
    }
  }
}

$("backToLogin")?.addEventListener("click", () => {
  window.location.href = "login.html";
});

$("signupSubmit")?.addEventListener("click", async () => {
  try {
    setMsg("");
    const email = normalize(emailEl?.value);
    const pw = normalize(pwEl?.value);
    const pw2 = normalize(pw2El?.value);
    const displayName = normalize(nameEl?.value);
    const churchName = normalize(churchEl?.value);

    if (!email) return setMsg("이메일을 입력해 주세요.", "err");
    if (!pw || pw.length < 8) return setMsg("비밀번호는 8자 이상으로 입력해 주세요.", "err");
    if (pw !== pw2) return setMsg("비밀번호 확인이 일치하지 않습니다.", "err");
    if (!churchName) return setMsg("소속 교회를 입력해 주세요.", "err");

    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    await upsertUserDoc(cred.user, { churchName });

    setMsg("회원가입 완료! 홈으로 이동합니다.", "ok");
    window.location.href = "index.html";
  } catch (e) {
    const code = e?.code || "";
    if (code.includes("auth/email-already-in-use")) return setMsg("이미 가입된 이메일입니다. 로그인해 주세요.", "err");
    if (code.includes("auth/invalid-email")) return setMsg("이메일 형식이 올바르지 않습니다.", "err");
    if (code.includes("auth/weak-password")) return setMsg("비밀번호가 너무 약합니다. 8자 이상으로 설정해 주세요.", "err");
    setMsg(`회원가입 실패: ${e?.message || e}` , "err");
  }
});

$("googleSignupBtn")?.addEventListener("click", async () => {
  try {
    setMsg("");
    const churchName = normalize(churchEl?.value);
    if (!churchName) return setMsg("Google로 시작하기 전에 소속 교회를 입력해 주세요.", "err");

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await upsertUserDoc(result.user, { churchName });
    setMsg("Google 로그인 완료! 홈으로 이동합니다.", "ok");
    window.location.href = "index.html";
  } catch (e) {
    setMsg(`Google 로그인 실패: ${e?.message || e}`, "err");
  }
});
