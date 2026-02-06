import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

const emailBtn = document.getElementById('emailBtn');
emailBtn.onclick = async () => {
  const email = email.value;
  const pw = password.value;
  await signInWithEmailAndPassword(auth, email, pw);
  document.getElementById('emailStep').style.display='none';
  document.getElementById('phoneStep').style.display='block';
};
