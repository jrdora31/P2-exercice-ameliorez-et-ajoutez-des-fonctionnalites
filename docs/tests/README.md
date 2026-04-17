# Rapports de tests et de couverture

Ce dossier regroupe les consignes de generation des rapports demandes pour le livrable OpenClassrooms.

## 1. Back-end : tests unitaires + integration + couverture JaCoCo

Depuis le dossier `BACKEND/Back-end---Testez-et-am-liorez-une-application-existante` :

```powershell
mvn verify
```

Rapports générés :

- couverture HTML : `target/site/jacoco/index.html`
- donnees brutes : `target/site/jacoco/jacoco.csv`
- rapports de tests Maven : `target/surefire-reports/`

Resultat valide le 17/04/2026 :

- `30 tests` back-end passes
- couverture JaCoCo globale :
  - `Instructions : 83,54 %`
  - `Lines : 80,90 %`
  - `Methods : 85,25 %`

## 2. Front-end : tests unitaires/integration Jest + couverture

Depuis le dossier `FRONTEND/Front-end---Testez-et-am-liorez-une-application-existante` :

```powershell
npm run test:coverage
```

Rapports generes :

- couverture HTML : `coverage/index.html`
- resume console Jest : couverture globale + nombre de tests passes

Resultat valide :

- `72 tests` front Jest passes
- couverture Jest globale :
  - `Statements : 98,35 %`
  - `Branches : 99,03 %`
  - `Functions : 98,46 %`
  - `Lines : 98,26 %`

## 3. Front-end : tests E2E Cypress

Le front doit etre demarre dans un autre terminal :

```powershell
npm start
```

Puis lancer Cypress :

```powershell
npm run e2e:run
```

Resultat attendu :

- toutes les specs E2E passent dans le terminal
- les fichiers de test sont dans `cypress/e2e/`
- les specs principales couvrent :
  - l'inscription
  - la connexion
  - la liste des etudiants
  - la creation / modification
  - le detail / la suppression

Note :

- Cypress fournit ici un rapport d'execution des tests E2E
- la couverture chiffree du code est fournie par JaCoCo pour le back et Jest pour le front

## 4. Bonne pratique pour le repository GitHub

A commiter :

- le code source
- les tests back-end
- les tests Jest du front
- les tests Cypress E2E
- ce fichier de documentation

A ne pas commiter :

- `BACKEND/.../target/`
- `FRONTEND/.../coverage/`
- `FRONTEND/.../node_modules/`
- `FRONTEND/.../cypress/screenshots/`
- `FRONTEND/.../cypress/videos/`

## 5. Preuves conseillees pour la soutenance

Tu peux ajouter dans `docs/tests/evidence/` :

- une capture du rapport JaCoCo back-end
- une capture du rapport Jest front-end
- une capture du run Cypress E2E

Ainsi, le repository contient :

- le code
- les tests
- la documentation pour regenerer les rapports
- les captures de preuve si besoin
