# stockapp3d
Cette application de visualisation 3D a été réalisée dans la cadre d'un besoin venant d'un de mes proches, 
les contraintes principales étaient d'avoir à faire tourner l'application en local sans installation ni serveur de fichier, le tout dans un navigateur.

J'ai utilisé BabyloneJS v8.9 pour m'aider sur les aspects 3D et affichage, Webpack pour automatiser le packaging et Typescript.


## Installation du projet
### Prérequis
- Installation du gestionnaire de packages `npm`

### Développer
- Cloner le repo et se mettre à la racine puis taper `npm install`
- Lancer le serveur avec `npm run start`
- Développer ! Chaque changement dans le code relancera l'onglet du projet

### Build
- Compiler le projet avec `npm run build`
- Récupérer le dossier `dist/` et le copier coller sur le poste cible
- Cliquer sur `dist/index.html` pour lancer le projet
