/*
 * ============================================================
 * CONFIGURAÇÃO FIREBASE — KF Store
 * ============================================================
 *
 * 1. Acesse https://console.firebase.google.com
 * 2. Crie um projeto (ex: kf-store)
 * 3. Adicione um app Web (ícone </>)
 * 4. Copie as credenciais abaixo
 * 5. No menu Build → Firestore Database → Criar banco (modo produção)
 * 6. Aba Regras → cole as regras do Firestore (abaixo)
 * 7. Build → Storage → Começar → cole as regras do Storage (abaixo)
 * 8. Build → Authentication → Começar → E-mail/Senha → Ativar
 * 9. Authentication → Users → Add user (email + senha do admin)
 *
 * --- REGRAS FIRESTORE ---
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /stores/{loja} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *   }
 * }
 *
 * --- REGRAS STORAGE ---
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     match /products/{allPaths=**} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *   }
 * }
 */

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBB95ru2HPeaLKWkGMLDkj2R0xgbZH_rRA',
  authDomain: 'kf-store-bfae9.firebaseapp.com',
  projectId: 'kf-store-bfae9',
  storageBucket: 'kf-store-bfae9.firebasestorage.app',
  messagingSenderId: '656929829116',
  appId: '1:656929829116:web:218bc4bf3dd20ed4856779'
};

const ADMIN_EMAIL = 'admin@admin.com';