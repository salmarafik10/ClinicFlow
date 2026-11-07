# ClinicFlow
ClinicFlow est une application web full-stack de gestion de cabinet médical, développée avec React, Node.js, Express et PostgreSQL. Elle permet de gérer les patients, de planifier les rendez-vous, de contrôler les accès selon les rôles et de suivre l'activité du cabinet à travers un tableau de bord interactif.


**Stack** : PostgreSQL, Express 5, React (Vite), Node.js, TypeScript, Prisma 7, Tailwind CSS 3.

## Fonctionnalités

- Authentification JWT, rôles `admin` et `staff`, mots de passe hashés (bcrypt)
- Patients : CRUD, recherche (nom/CIN), pagination, suppression admin (soft delete), restauration
- Rendez-vous : création, modification, filtres date/statut, changement de statut
- **Règle métier** : pas deux rendez-vous confirmés à moins de 30 minutes pour un même patient
- Dashboard : compteurs, graphiques, prochains rendez-vous
- Journal d'audit et gestion des utilisateurs (admin), changement de mot de passe
- Validation Zod, gestion d'erreurs (400/401/403/404/409/500), rate limiting, helmet, CORS
- Tests Supertest, documentation Swagger, CI GitHub Actions

## Prérequis

- Node.js 22 (20.19 minimum)
- PostgreSQL 16

## Installation

```bash
git clone <url-du-depot>
cd ClinicFlow
```

### 1. Base de données

Créer une base `clinicflow` dans PostgreSQL (pgAdmin ou `createdb clinicflow`).

### 2. Backend

```bash
cd server
cp .env.example .env      # puis renseigner DATABASE_URL et JWT_SECRET
npm install
npx prisma migrate deploy # applique les migrations (y compris index et contraintes SQL)
npm run db:seed           # données de test
npm run dev               # http://localhost:5000
```

Sous PowerShell, remplace `cp` par `copy`.

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Comptes de test (seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@clinicflow.com | Admin123! |
| Staff | staff1@clinicflow.com | Staff123! |
| Staff | staff2@clinicflow.com | Staff123! |

Le seed crée 1 admin, 2 staff, 5 patients et 10 rendez-vous (pending, confirmed, cancelled).

## Commandes

| Commande (dans `server/`) | Rôle |
|---|---|
| `npm run dev` | Serveur en développement |
| `npm run build` / `npm start` | Compilation / production |
| `npm run db:migrate` | Nouvelle migration (dev) |
| `npm run db:seed` | Remplir la base |
| `npm run db:studio` | Interface Prisma Studio |
| `npm test` | Tests (base de test requise) |

## Tests

Les tests utilisent une base dédiée, jamais la base de développement.

1. Créer la base `clinicflow_test`.
2. Créer `server/.env.test` avec `DATABASE_URL` pointant vers cette base (le nom doit contenir `test`), ainsi que `JWT_SECRET`.
3. Appliquer les migrations sur cette base : `npx dotenv -e .env.test -- npx prisma migrate deploy`.
4. `npm test`.

Ils couvrent l'authentification, les rôles, les patients et la règle des 30 minutes (y compris les requêtes simultanées).

## API

Documentation interactive : `http://localhost:5000/api/docs` (Swagger UI).

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | connecté |
| GET/POST | `/api/patients` | connecté |
| GET/PUT | `/api/patients/:id` | connecté |
| DELETE | `/api/patients/:id` | admin |
| GET | `/api/patients/deleted` | admin |
| PATCH | `/api/patients/:id/restore` | admin |
| GET/POST | `/api/appointments` | connecté |
| PUT | `/api/appointments/:id` | connecté |
| PATCH | `/api/appointments/:id/status` | connecté |
| GET | `/api/dashboard/stats` | connecté |
| GET | `/api/audit-logs` | admin |
| GET/POST/PATCH | `/api/users` | admin |
| PUT | `/api/users/me/password` | connecté |

## Architecture

```
server/src/
├── config/        env validé (Zod), client Prisma
├── routes/        définition des routes
├── controllers/   validation des entrées, réponses HTTP
├── services/      logique métier et accès aux données
├── middlewares/   authentification, rôles, erreurs
├── validators/    schémas Zod
└── utils/         AppError, JWT
client/src/
├── pages/  components/  layouts/  routes/  context/  api/  types/
```

## Conception de la base

Voir [docs/DATABASE.md](docs/DATABASE.md) : ERD, relations, règles de suppression, contraintes et index.

## Choix de sécurité

- JWT signé avec expiration, mots de passe hashés avec bcrypt
- Comparaison de mot de passe à temps constant même si l'email est inconnu
- Rate limiting global et renforcé sur `/auth/login`
- Comptes désactivables, un admin ne peut pas se rétrograder lui-même
- Le token est stocké dans `localStorage` pour simplifier ; en production, un cookie `httpOnly` avec refresh token serait préférable.

## Docker

Des fichiers `Dockerfile` et un `docker-compose.yml` sont fournis (`docker compose up --build`).

## CI

GitHub Actions : migrations, tests et build du serveur, build du client.
