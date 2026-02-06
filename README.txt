STILL Auth Pack

1) Put these files into your /STILL folder on GitHub Pages:
   - index.html (updated)
   - login.html
   - auth/firebase.js
   - auth/guard.js
   - auth/login.js

2) Add <script type="module" src="auth/guard.js"></script> to the <head> of ALL pages you want protected.
   (index.html already has it.)

3) Firebase Console:
   - Authentication: Email/Password ON, Phone ON
   - Authorized domains: kimyebin726.github.io
   - Firestore: users collection exists

Done.
