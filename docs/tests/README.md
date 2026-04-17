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

- couverture HTML : `coverage/index.html` (à vérifier car erreur)
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