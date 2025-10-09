# Migration Firebase → Supabase

## ✅ Changements effectués

### Frontend (React Native/Expo)

1. **Nouveau fichier de configuration** - `config/supabase.ts`

   - Remplace `config/firebase.ts`
   - Configure le client Supabase avec AsyncStorage pour la persistance de session

2. **AuthContext mis à jour** - `contexts/AuthContext.tsx`

   - Utilise maintenant `@supabase/supabase-js`
   - Méthodes `signIn`, `signUp`, `logout` adaptées à l'API Supabase
   - Ajout de `session` dans le contexte pour accès au token

3. **Hook useApi mis à jour** - `hooks/useApi.ts`
   - Récupère le token via `supabase.auth.getSession()`
   - Utilise `session.access_token` au lieu de `getIdToken()`

### Backend (Node.js/Express)

1. **Middleware d'authentification** - `backend/middleware/auth.js`

   - Remplace Firebase Admin par Supabase
   - Utilise `supabase.auth.getUser(token)` pour vérifier les tokens JWT

2. **Server.js nettoyé** - `backend/server.js`
   - Suppression de l'initialisation Firebase Admin

## 🔧 Configuration requise

### 1. Créer un projet Supabase

Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet.

### 2. Variables d'environnement

#### Frontend - Créer `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
EXPO_PUBLIC_API_URL=http://localhost:5000
```

#### Backend - Créer/modifier `backend/.env` :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_KEY=votre_service_role_key
MONGODB_URI=votre_mongodb_uri
PORT=5000
```

### 3. Obtenir les clés Supabase

Dans votre projet Supabase :

1. Allez dans **Settings** → **API**
2. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY` (frontend)
   - `service_role` key → `SUPABASE_SERVICE_KEY` (backend) ⚠️ **À garder secret!**

### 4. Activer l'authentification Email dans Supabase

1. Dans Supabase, allez dans **Authentication** → **Providers**
2. Activez **Email**
3. Désactivez **Confirm email** si vous voulez permettre une connexion immédiate (dev)

## 📦 Packages ajoutés

- Backend : `@supabase/supabase-js` (déjà installé)
- Frontend : `@supabase/supabase-js` (déjà présent)

## 🗑️ Packages à supprimer (optionnel)

Une fois que tout fonctionne, vous pouvez supprimer les packages Firebase :

### Frontend

```bash
npm uninstall firebase @firebase/auth-compat @react-native-firebase/app @react-native-firebase/auth
```

### Backend

```bash
cd backend
npm uninstall firebase firebase-admin @react-native-firebase/app @react-native-firebase/auth
```

## 🔄 Migration des utilisateurs (si nécessaire)

Si vous avez des utilisateurs Firebase existants :

1. Exportez les utilisateurs de Firebase
2. Utilisez l'API Supabase Admin pour les créer :

```javascript
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(url, serviceKey);

// Pour chaque utilisateur Firebase
await supabase.auth.admin.createUser({
  email: user.email,
  password: "temporary-password", // Envoyez un reset password
  email_confirm: true,
});
```

## ⚡ Différences clés Firebase vs Supabase

| Aspect         | Firebase                       | Supabase               |
| -------------- | ------------------------------ | ---------------------- |
| Token          | `user.getIdToken()`            | `session.access_token` |
| User ID        | `user.uid`                     | `user.id`              |
| Auth State     | `onAuthStateChanged`           | `onAuthStateChange`    |
| Sign In        | `signInWithEmailAndPassword`   | `signInWithPassword`   |
| Backend Verify | `admin.auth().verifyIdToken()` | `auth.getUser(token)`  |

## ✅ Tests à effectuer

1. ✅ Inscription d'un nouvel utilisateur
2. ✅ Connexion avec email/password
3. ✅ Déconnexion
4. ✅ Persistance de session (fermer/rouvrir app)
5. ✅ Appels API authentifiés (création recette, etc.)
6. ✅ Expiration de token / Renouvellement automatique

## 🐛 Debugging

Si vous rencontrez des problèmes :

1. **"Missing Supabase environment variables"**

   - Vérifiez que les variables d'env sont bien définies
   - Redémarrez Expo : `npm start -- --clear`

2. **"Invalid token" côté backend**

   - Vérifiez que `SUPABASE_SERVICE_KEY` est la clé `service_role` et non `anon`
   - Vérifiez que les URLs correspondent

3. **Session non persistée**
   - Vérifiez que `react-native-url-polyfill` et `@react-native-async-storage/async-storage` sont installés

## 🚀 Prochaines étapes

Supabase offre bien plus que l'authentification :

- **Database** : Postgre SQL avec RLS (Row Level Security)
- **Storage** : Stockage de fichiers
- **Realtime** : Subscriptions temps réel
- **Edge Functions** : Serverless functions

Vous pourriez migrer progressivement de MongoDB vers Supabase Postgres pour tout centraliser!
