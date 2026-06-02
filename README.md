# Lootopia Frontend

Un frontend moderne et complet pour la plateforme Lootopia, développé avec **React**, **Next.js** et **TailwindCSS**.

## 🚀 Caractéristiques

✅ **Authentification Sécurisée** - JWT-based authentication avec gestion d'état globale
✅ **Recherche de Chasses** - Découvrez les chasses avec recherche en temps réel
✅ **Cartographie Interactive** - Visualisez les étapes sur une carte Leaflet
✅ **Réalité Augmentée** - Intégration AR.js pour une expérience immersive
✅ **Système de Gamification** - Points, niveaux, achievements et leaderboard
✅ **Interface Responsive** - Design mobile-first avec TailwindCSS
✅ **Animations Fluides** - Animations avec Framer Motion
✅ **Gestion d'État** - Zustand pour une gestion d'état simple et efficace

## 📁 Structure du Projet

```
src/
├── app/
│   ├── auth/              # Pages d'authentification (login, register)
│   ├── chases/            # Pages des chasses (liste, détails)
│   ├── profile/           # Page du profil utilisateur
│   ├── my-chases/         # Chasses de l'utilisateur
│   ├── leaderboard/       # Classement global
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/            # Composants réutilisables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── NotificationContainer.tsx
│   ├── InteractiveMap.tsx
│   ├── ARViewer.tsx
│   ├── ChaseCard.tsx
│   ├── StepList.tsx
│   ├── GamificationStats.tsx
│   ├── LeaderboardComponent.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── hooks/                 # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useAsync.ts
│   ├── useGeolocation.ts
│   └── useDebounce.ts
├── lib/                   # Services et utilitaires
│   ├── api-client.ts      # Client Axios configuré
│   ├── auth-service.ts
│   ├── chase-service.ts
│   ├── gamification-service.ts
│   ├── storage-service.ts
│   ├── auth-store.ts      # Zustand store pour l'auth
│   ├── chase-store.ts
│   ├── notification-store.ts
├── types/                 # Types TypeScript
│   └── index.ts
```

## 🛠️ Installation & Démarrage

### Prérequis
- Node.js 16+ et npm/yarn
- Backend API en cours d'exécution (http://localhost:3001)

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Modifier .env.local avec vos configurations
```

### Démarrage du serveur de développement

```bash
npm run dev
```

Accédez à l'application: [http://localhost:3000](http://localhost:3000)

## 📚 Pages et Fonctionnalités

### 🏠 Page d'Accueil (`/`)
- Vue d'ensemble du projet
- CTA pour explorer les chasses
- Statistiques principales

### 🔐 Authentification
- **Login** (`/auth/login`) - Connexion utilisateur
- **Register** (`/auth/register`) - Création de compte

### 🗺️ Chasses
- **Lister** (`/chases`) - Voir toutes les chasses disponibles avec recherche
- **Détails** (`/chases/[id]`) - Voir les détails d'une chasse, interagir avec les étapes et AR

### 👤 Profil
- **Profil** (`/profile`) - Voir les stats du joueur et le classement personnel
- **Mes Chasses** (`/my-chases`) - Chasses en cours

### 🏆 Leaderboard
- **Global** (`/leaderboard`) - Voir le classement de tous les joueurs

## 🔌 Integration API

Tous les services sont situés dans le dossier `lib/`:

```typescript
// Authentification
await authService.register(email, username, password);
await authService.login(email, password);
await authService.logout();

// Chasses
await chaseService.getChases(page, limit);
await chaseService.getChase(chaseId);
await chaseService.searchChases(query);
await chaseService.startChase(chaseId);
await chaseService.getCaseProgress(chaseId);
await chaseService.completeStep(chaseId, stepId);

// Gamification
await gamificationService.getLeaderboard(limit);
await gamificationService.getUserStats(userId);
await gamificationService.getUserRank(userId);
```

## 🎨 Personnalisation

### Couleurs et Thème
Modifiez `tailwind.config.ts`:

```typescript
colors: {
  primary: '#FF6B35',      // Orange
  secondary: '#004E89',    // Bleu
  accent: '#F77F00',       // Jaune
}
```

### Styles Globaux
Modifiez `src/app/globals.css`

## 🔒 Sécurité

- ✅ Tokens JWT stockés en cookies sécurisés
- ✅ CSRF protection automatique
- ✅ Validation des formulaires côté client
- ✅ Interception des erreurs 401 (non authentifié)

## 🚀 Déploiement

### Avec Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Avec Docker

```bash
# Créer l'image
docker build -t lootopia-frontend .

# Lancer le conteneur
docker run -p 3000:3000 lootopia-frontend
```

### Build de production

```bash
npm run build
npm run start
```

## 📦 Dépendances Principales

- **next** - Framework React
- **react** - Bibliothèque UI
- **tailwindcss** - Styling CSS utilitaire
- **axios** - Client HTTP
- **zustand** - Gestion d'état
- **framer-motion** - Animations
- **react-leaflet** - Cartes interactives
- **ar.js** - Réalité augmentée

## 🧪 Tests

```bash
npm run test        # Lancer les tests
npm run test:watch  # Mode watch
```

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Leaflet](https://react-leaflet.js.org)
- [AR.js](https://github.com/jeromeetienne/AR.js)

## 📝 Variable d'Environnement

Créez un fichier `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez suivre les directives:

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue.

---

**Bon codage! 🚀**
