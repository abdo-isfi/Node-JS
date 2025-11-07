# CAR RENTAL API

## Mini-Project (Niveau 2)

### 1. Objectif Pédagogique

Concevoir une API REST Express.js modulaire pour la location de voitures : gestion du parc, disponibilités, création de locations, retour et tarification simple.

Le projet consolide : routage, middlewares spécialisés (auth, logging), lecture/écriture JSON, validation et gestion d’erreurs.

### 2. Livrables attendus

*   Application Express structurée (routes / controllers / services / middlewares / data).
*   Endpoints REST pour cars et rentals (lecture/écriture dans fichiers JSON ou en mémoire).
*   Middlewares : auth (clé d’accès simple), logger, errorHandler.
*   README.md

### 3. Spécification fonctionnelle

*   **Calcul des jours:** Inclusif exclusif standard (to - from) en jours (exclure le jour de retour).
*   **Tarification:** `total = days * dailyRate` (arrondi à 2 décimales).

### 4. Endpoints

#### Cars

*   **GET /api/cars** — Liste avec filtres : `?category=suv&available=true&minPrice=30&maxPrice=70&q=plate-or-model`
*   **GET /api/cars/:id** — Détails d’un véhicule.
*   **POST /api/cars** — [protégé] Créer un véhicule (admin/simple auth).
*   **PUT /api/cars/:id** — [protégé] Modifier un véhicule.
*   **DELETE /api/cars/:id** — [protégé] Supprimer un véhicule (ou passer `available=false`).

#### Rentals

*   **GET /api/rentals** — Liste (filtres : `status`, `from`, `to`, `carId`).
*   **GET /api/rentals/:id** — Détails.
*   **POST /api/rentals** — Créer une location (réservations et disponibilité).
*   **PUT /api/rentals/:id/return** — Retourner une voiture → met `status=returned` et `car.available=true`.
*   **DELETE /api/rentals/:id** — Annuler une location → `status=cancelled`.

#### Health & Static

*   **GET /health** → `{ status: "ok", uptime, timestamp }`
*   **GET /** → page statique (optionnelle) via `express.static("public")`.

### 5. Règles métier

1.  **Disponibilité:** On ne peut pas créer de location si `car.available=false`.
2.  **Chevauchement:** Deux rentals pour la même voiture ne doivent pas se chevaucher sur les dates.
3.  **Dates:** `from < to`, format `YYYY-MM-DD`, `days >= 1`.
4.  **Tarification:** `dailyRate = car.pricePerDay`; `total = days * dailyRate`.
5.  **Statuts Rental:**
    *   `active` à la création,
    *   `returned` via `/return`,
    *   `cancelled` via `DELETE`.
6.  **Mise à jour disponibilité:**
    *   À la création d’un rental : `car.available=false` (option simple).
    *   Au retour : `car.available=true`.

### 6. Structure recommandée

*   `routes`: déclare les endpoints, uniquement du câblage.
*   `controllers`: validations, statuts HTTP, mapping requête → service.
*   `services`: logique métier (filtres, disponibilité, chevauchement, tarification).
*   `middlewares`: auth (vérifie token), logger (horodatage, méthode, url, status, durée), errorHandler (format unique).

### 7. Middlewares & Validation

#### Auth (simple)

*   Header : `Authorization: Bearer <TOKEN>`
*   `.env` : `API_TOKEN=secret123`
*   `auth.js` : comparer le token autorisé pour POST/PUT/DELETE des cars et actions sensibles des rentals.

#### Logger

*   Format : `"[ISO] METHOD URL -> STATUS in Xms"`

#### Error Handler

*   Réponse standard : `{ "status": "error", "message": "string", "code": 400, "timestamp": "ISO" }`

#### Validation contrôleurs

*   **Cars (POST/PUT):** `brand`, `model`, `category` ∈ `{eco,sedan,suv,van}`, `pricePerDay>0`, `plate` unique.
*   **Rentals (POST):** `carId`, `customer.name`, `customer.email` (format), `from`, `to` valides.

### 8. Logique clé côté services

#### Disponibilité & Chevauchement (simplifié)

*   Si la voiture a un rental actif (`status=active`) dont l’intervalle `[from, to)` chevauche la nouvelle demande → refus (`409 Conflict`).

#### Chevauchement (pseudo)

```javascript
function overlaps(aFrom, aTo, bFrom, bTo) {
  return aFrom < bTo && bFrom < aTo;
}
```

#### Calcul du nombre de jours

`days = max(1, differenceInDays(to, from))`

### 9. Scénarios de test (curl)

**1) Lister les voitures disponibles**

```bash
curl "http://localhost:3000/api/cars?available=true&category=suv&minPrice=30&maxPrice=70"
```

**2) Créer une voiture (protégé)**

```bash
curl -X POST http://localhost:3000/api/cars -H "Content-Type: application/json" -H "Authorization: Bearer secret123" -d '{"brand":"Toyota","model":"Corolla","category":"sedan","plate":"ABC-123","pricePerDay":42.5}'
```

**3) Créer une location**

```bash
curl -X POST http://localhost:3000/api/rentals -H "Content-Type: application/json" -d '{ "carID":"<ID_INSERER>", "customer":{"name":"Alice","email":"alice@example.com"}, "from":"2025-11-02", "to":"2025-11-05" }'
```

**4) Retourner une voiture**

```bash
curl -X PUT http://localhost:3000/api/rentals/<RENTAL_ID>/return
```

**5) Annuler une location**

```bash
curl -X DELETE http://localhost:3000/api/rentals/<RENTAL_ID>
```

### 10. Installation et Lancement

1.  **Cloner le dépôt :**

    ```bash
    git clone <URL_DU_DEPOT>
    cd <NOM_DU_DOSSIER>
    ```

2.  **Installer les dépendances :**

    ```bash
    npm install
    ```

3.  **Variables d'environnement :** Créez un fichier `.env` à la racine du projet avec les variables suivantes :

    ```
    PORT=3000
    API_TOKEN=secret123
    ```

4.  **Lancer l'application :**

    ```bash
    npm start
    ```

    L'API sera accessible à `http://localhost:3000` (ou le port défini dans `.env`).
