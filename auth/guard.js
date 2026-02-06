import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const REQUIRED = (profile) => {
  const churchOk = !!(profile?.churchName && String(profile.churchName).trim().length > 1);
  const denomOk  = !!(profile?.denomination && String(profile.denomination).trim().length > 1);
  const emailOk  = profile?.emailVerified === true;
  const phoneOk  = profile?.phoneVerified === true;
  return churchOk && denomOk && emailOk && phoneOk;
};

function toLogin() {
  const here = location.pathname.split("/").pop() || "index.html";
  const next = encodeURIComponent(here + location.search + location.hash);
  location.replace(`login.html?next=${next}`);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return toLogin();

  // ensure user doc exists
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const base = {
    uid: user.uid,
    email: user.email || "",
    emailVerified: !!user.emailVerified,
    phoneNumber: user.phoneNumber || "",
    phoneVerified: !!user.phoneNumber, // phoneNumber present means linked
    updatedAt: serverTimestamp(),
  };

  let profile = snap.exists() ? snap.data() : null;
  if (!profile) {
    await setDoc(ref, { ...base, createdAt: serverTimestamp(), churchName:"", denomination:"" }, { merge:true });
    profile = { ...base, churchName:"", denomination:"" };
  } else {
    // keep verification flags in sync
    await setDoc(ref, base, { merge:true });
    profile = { ...profile, ...base };
  }

  if (!REQUIRED(profile)) return toLogin();
});
