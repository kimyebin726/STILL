// auth/header-auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

function qs(sel){ return document.querySelector(sel); }
function setVisible(el, show){
  if(!el) return;
  el.style.display = show ? "flex" : "none";
}

function initHeaderAuth(){
  const logoutBtn = qs("#logoutBtn");

  // Bind logout click once
  if (logoutBtn && !logoutBtn.dataset.bound){
    logoutBtn.dataset.bound = "1";
    logoutBtn.addEventListener("click", async () => {
      try{
        await signOut(auth);
        window.location.href = "index.html";
      }catch(e){
        console.error(e);
        alert("로그아웃 실패: " + (e?.message || e));
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    const path = (location.pathname || "").toLowerCase();
    const isLoginPage = path.endsWith("/login.html") || path.endsWith("login.html");
    if (isLoginPage){
      setVisible(logoutBtn, false);
      return;
    }
    // Match index.html rule across ALL pages:
    // - Logged in: show logout
    // - Logged out: show nothing (no header login button)
    setVisible(logoutBtn, !!user);
  });
}

document.addEventListener("DOMContentLoaded", initHeaderAuth);
