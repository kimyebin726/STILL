import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRCZ1aZtdGgkbSOMAWrXLViDoZuAoCfLk",
  authDomain: "project-31962698-a25c-49c1-ac5.firebaseapp.com",
  projectId: "project-31962698-a25c-49c1-ac5",
  appId: "1:153683084088:web:75c28d4de59f2cd03477cd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
