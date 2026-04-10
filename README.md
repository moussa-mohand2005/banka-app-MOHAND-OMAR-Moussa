# BankaApp - Simulation Bancaire Mobile

BankaApp est une application mobile développée en React Native (Expo) qui simule le fonctionnement d'un système bancaire de manière interactive. Elle propose une interface moderne et fluide, permettant de gérer plusieurs comptes bancaires en temps réel.

## Fonctionnalités Principales

- **Tableau de Bord (Dashboard) :** Affichage intuitif de tous les comptes bancaires avec leurs soldes actualisés. Les comptes sont présentés via des cartes au design minimaliste de type "FinTech", avec un suivi analytique du budget de l'utilisateur.
- **Historique et Tri Chronologique :** Un écran dédié liste l'intégralité des opérations effectuées (débits, crédits, virements). Les transactions sont classées par ordre chronologique décroissant de manière automatique. Des boutons de filtrage sont implémentés pour segmenter les opérations par type.
- **Opérations Bancaires Avancées :**
  - **Créditer :** Ajouter des fonds sur un compte.
  - **Débiter :** Retirer des fonds. Si le solde est insuffisant par rapport à la demande, l'opération est refusée en arrière-plan afin d'éviter tout solde négatif anormal.
  - **Virement Inter-comptes :** Mécanisme de transfert d'argent depuis un compte source vers un compte destinataire. La fonction gère la création de deux transactions simultanées ("Paiement émis" et "Paiement reçu").
- **Thématisation (Mode Clair / Sombre) :** Le projet intègre un Context de Thème global (React Context API) qui ajuste de façon réactive toute l'interface, de l'arrière-plan de navigation à la couleur du texte, selon les préférences définies.
- **Réinitialisation des données :** Une fonction intégrée permet de remettre la totalité de l'état asynchrone à ses valeurs de départ pour effectuer de nouvelles simulations facilement.

## Architecture du Code Source

Afin de maximiser la lisibilité et l'évolutivité, le code source respecte le principe de séparation des responsabilités :

- `/src/components/` : Contient les composants visuels réutilisables, tels que la carte d'un compte (`AccountCard`) ou l'affichage de la ligne de transaction détaillée (`TransactionItem`).
- `/src/screens/` : Regroupe les affichages plein écran : le Dashboard, la fenêtre détaillée du compte, l'écran de transfert exclusif, et la page historique globale.
- `/src/theme/` : Concentrateur de l'apparence visuelle, palettes de couleurs (Color System), et le `ThemeProvider`.
- `/src/data/` : Abrite les jeux de données mockups (comptes pré-configurés) utilisés pour initialiser l'application.
- `App.js` : Fichier racine orchestrant la hiérarchie de navigation (une base Tab Navigation, couplée à un Stack navigator), et contenant l'état "vérité" des portefeuilles (*Lifting State Up*).

## Stack Technologique

- **Framework Front-end :** React Native (géré via l'outil Expo)
- **Routage / Navigation :** React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Gestion de l'État :** React Hooks classiques (`useState`, `useContext`)
- **Stylisation :** API `StyleSheet` intégrée au framework, sans recours à des bibliothèques externes pour l'UI.

## Prérequis d'Installation

Assurez-vous de posséder l'environnement de développement suivant :
- [Node.js](https://nodejs.org/) installé sur la machine de test.
- [Expo CLI](https://docs.expo.dev/) (normalement exécutable via `npx`).
- Un simulateur Android ou iOS disponible, ou bien l'application **Expo Go** téléchargée sur un appareil physique (smartphone).

## Installation et Démarrage

1. **Cloner ou extraire le projet localement :**
   ```bash
   # Naviguez à l'intérieur du dossier clone
   cd banka-app
   ```

2. **Installer les dépendances Node :**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement de l'application :**
   ```bash
   npx expo start
   ```

4. **Déployer et tester :**
   - L'outil affichera un **QR Code** dans votre terminal.
   - Ouvrez l'application **Expo Go** sur votre téléphone portable, et scannez le code pour compiler instantanément le code Javascript sur votre appareil.
   - En alternative, pressez la touche `a` de votre clavier depuis le terminal pour forcer le lancement sur l'émulateur Android, ou `i` pour le Simulateur iPhone.

## Bonnes Pratiques Appliquées

- **Fiabilisation des Saisies (UX) :** Intégration du module `KeyboardAvoidingView` permettant l'ajustement dynamique de l'écran lors du déclenchement du clavier virtuel, et évitant le recouvrement incommodant des entrées (Inputs).
- **Maintien d'un "Source Of Truth" Réunifiée :** Les données des comptes résident sur l'entité mère de navigation, évitant ainsi le risque de désynchronisation entre les vues directes et la page d'historisation. Des identifiants (IDs) sont passés dans les paramètres de la navigation native en remplacement de l'envoi "dangereux" des entités en tant qu'objets purs (*Props Drilling control*).
- **Architecture Logique et Nommage Identifiable :** Des conventions explicites qui garantissent la solidité conceptuelle en cas d'ajout progressif de librairies à l'architecture.
  
**Scanner le QR Code** avec l'application Expo Go ou l'appareil photo de votre téléphone.
  
  <img width="228" height="266" alt="QR" src="https://github.com/user-attachments/assets/507a4243-9ea3-4086-a005-7b9fa0da4aca" />

