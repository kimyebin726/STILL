import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  reload,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const $ = (sel) => document.querySelector(sel);

const next = new URLSearchParams(location.search).get("next") || "index.html";

const emailEl = $("#email");
const pwEl = $("#password");
const msgEl = $("#msg");

const stepEmail = $("#stepEmail");
const stepVerify = $("#stepVerify");
const stepPhone = $("#stepPhone");
const stepChurch = $("#stepChurch");

const btnSignup = $("#btnSignup");
const btnLogin = $("#btnLogin");
const btnSendVerify = $("#btnSendVerify");
const btnIverified = $("#btnIverified");
const btnSendSms = $("#btnSendSms");
const btnConfirmSms = $("#btnConfirmSms");
const btnSaveChurch = $("#btnSaveChurch");
const btnLogout = $("#btnLogout");

const phoneEl = $("#phone");
const smsEl = $("#smscode");
const churchEl = $("#churchName");
const denomEl = $("#denomination");

let confirmationResult = null;
let recaptcha = null;

function setMsg(t){ msgEl.textContent = t || ""; }
function show(el){ el.style.display = "block"; }
function hide(el){ el.style.display = "none"; }

function normalizeKoreaPhone(input){
  const raw = (input||"").replace(/\s|-/g,"").trim();
  if(!raw) return "";
  // accept +82... as-is
  if(raw.startsWith("+")) return raw;
  // 010xxxxxxxx -> +8210xxxxxxxx
  if(raw.startsWith("0")) return "+82" + raw.substring(1);
  return raw; // fallback
}

async function upsertUserDoc(user, extra={}){
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email || "",
    emailVerified: !!user.emailVerified,
    phoneNumber: user.phoneNumber || "",
    phoneVerified: !!user.phoneNumber,
    ...extra,
    updatedAt: serverTimestamp(),
  }, { merge:true });
}

function routeByState(user){
  hide(stepEmail); hide(stepVerify); hide(stepPhone); hide(stepChurch);

  if(!user){
    show(stepEmail);
    return;
  }
  if(!user.emailVerified){
    show(stepVerify);
    return;
  }
  if(!user.phoneNumber){
    show(stepPhone);
    return;
  }
  // church/denom check in firestore
  (async ()=>{
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    churchEl.value = data.churchName || "";
    denomEl.value = data.denomination || "";
    const ok = (data.churchName && String(data.churchName).trim().length>1) &&
               (data.denomination && String(data.denomination).trim().length>1);
    if(ok){
      location.replace(next);
    }else{
      show(stepChurch);
    }
  })();
}

btnSignup.addEventListener("click", async ()=>{
  setMsg("");
  try{
    const email = emailEl.value.trim();
    const pw = pwEl.value;
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await sendEmailVerification(cred.user);
    await upsertUserDoc(cred.user, { createdAt: serverTimestamp() });
    setMsg("✅ 가입 완료! 이메일로 인증 링크를 보냈어요. 메일함에서 인증 후 돌아와 '인증 완료했어요'를 눌러주세요.");
    routeByState(cred.user);
  }catch(e){
    console.error(e);
    setMsg("❌ 가입 실패: " + (e?.message || e));
  }
});

btnLogin.addEventListener("click", async ()=>{
  setMsg("");
  try{
    const email = emailEl.value.trim();
    const pw = pwEl.value;
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    await upsertUserDoc(cred.user);
    routeByState(cred.user);
  }catch(e){
    console.error(e);
    setMsg("❌ 로그인 실패: " + (e?.message || e));
  }
});

btnSendVerify.addEventListener("click", async ()=>{
  setMsg("");
  try{
    if(!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    setMsg("📩 인증 메일을 다시 보냈어요. 메일에서 인증 후 돌아와 주세요.");
  }catch(e){
    console.error(e);
    setMsg("❌ 인증 메일 재전송 실패: " + (e?.message || e));
  }
});

btnIverified.addEventListener("click", async ()=>{
  setMsg("");
  try{
    if(!auth.currentUser) return;
    await reload(auth.currentUser);
    await upsertUserDoc(auth.currentUser);
    routeByState(auth.currentUser);
    if(!auth.currentUser.emailVerified){
      setMsg("아직 이메일 인증이 확인되지 않았어요. 메일 인증 후 다시 눌러주세요.");
    }
  }catch(e){
    console.error(e);
    setMsg("❌ 확인 실패: " + (e?.message || e));
  }
});

function ensureRecaptcha(){
  if(recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(auth, "recaptcha", {
    size: "normal",
  });
  return recaptcha;
}

btnSendSms.addEventListener("click", async ()=>{
  setMsg("");
  try{
    const user = auth.currentUser;
    if(!user) return;
    const phone = normalizeKoreaPhone(phoneEl.value);
    if(!phone) { setMsg("전화번호를 입력해 주세요."); return; }

    ensureRecaptcha();
    confirmationResult = await linkWithPhoneNumber(user, phone, recaptcha);
    setMsg("✅ 인증번호(SMS)를 보냈어요. 아래 칸에 입력해 주세요.");
  }catch(e){
    console.error(e);
    setMsg("❌ SMS 전송 실패: " + (e?.message || e));
  }
});

btnConfirmSms.addEventListener("click", async ()=>{
  setMsg("");
  try{
    if(!confirmationResult) { setMsg("먼저 인증번호를 요청해 주세요."); return; }
    const code = smsEl.value.trim();
    if(!code) { setMsg("인증번호를 입력해 주세요."); return; }
    await confirmationResult.confirm(code);
    await upsertUserDoc(auth.currentUser);
    routeByState(auth.currentUser);
  }catch(e){
    console.error(e);
    setMsg("❌ 인증번호 확인 실패: " + (e?.message || e));
  }
});

btnSaveChurch.addEventListener("click", async ()=>{
  setMsg("");
  try{
    const user = auth.currentUser;
    if(!user) return;
    const churchName = churchEl.value.trim();
    const denomination = denomEl.value.trim();
    if(churchName.length < 2) return setMsg("교회명을 입력해 주세요.");
    if(denomination.length < 2) return setMsg("교단/소속을 입력해 주세요.");

    await upsertUserDoc(user, {
      churchName,
      denomination,
      profileCompletedAt: serverTimestamp(),
    });

    setMsg("✅ 완료! 잠시 후 메인으로 이동합니다…");
    setTimeout(()=> location.replace(next), 600);
  }catch(e){
    console.error(e);
    setMsg("❌ 저장 실패: " + (e?.message || e));
  }
});

btnLogout.addEventListener("click", async ()=>{
  try{ await signOut(auth); }catch(e){ console.error(e); }
});

onAuthStateChanged(auth, (user)=>{
  routeByState(user);
});
