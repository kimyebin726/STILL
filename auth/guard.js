import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
const isLogin = current === "login.html";

onAuthStateChanged(auth, (user) => {
  if (!user && !isLogin) {
    // remember where user wanted to go
    const dest = encodeURIComponent(current || "index.html");
    location.replace(`login.html?next=${dest}`);
  }
});
