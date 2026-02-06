// auth/header-auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

function qs(sel){ return document.querySelector(sel); }
function setVisible(el, show){
  if(!el) return;
  el.style.display = show ? "flex" : "none";
}

function initHeaderAuth(){
  const loginBtn = qs("#loginBtn");
  const logoutBtn = qs("#logoutBtn");

  // Bind logout click once
  if (logoutBtn && !logoutBtn.dataset.bound){
    logoutBtn.dataset.bound = "1";
    logoutBtn.addEventListener("click", async () => {
      try{
        await signOut(auth);
        // after logout always go to index
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
    const isIndexPage = path.endsWith("/index.html") || path.endsWith("index.html") || path.endsWith("/");
    
    // LOGIN PAGE: do not show header login/logout buttons (keep the main login UI only)
    if (isLoginPage){
      setVisible(loginBtn, false);
      setVisible(logoutBtn, false);
      return;
    }

    // INDEX PAGE: keep ONLY logout button (no login button)
    if (isIndexPage){
      setVisible(loginBtn, false);
      setVisible(logoutBtn, !!user);
      return;
    }

    // OTHER PAGES: show login when logged out, show logout when logged in
    if (user){
      setVisible(logoutBtn, true);
      setVisible(loginBtn, false);
    }else{
      setVisible(logoutBtn, false);
      setVisible(loginBtn, true);
    }
  });
}

document.addEventListener("DOMContentLoaded", initHeaderAuth);
