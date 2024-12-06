Partager


Vous avez dit :
Technologies à utiliser:

● Node.js
● Express
● Handlebars
● MySQL

Objectif:

Créer une application web permettant aux étudiants de suggérer des formations avec les
fonctionnalités suivantes :
1. Une route GET /liste-formations qui affiche la liste des formations suggérées.
○ Chaque formation doit être décrite par :
■ Le titre de la formation (obligatoire).
■ Une description détaillée (minimum 100 caractères, obligatoire).
■ Le nom de l’étudiant qui a suggéré la formation (obligatoire).
■ La date de suggestion (ajoutée automatiquement lors de
l’enregistrement).

2. Une route GET /ajouter-formation qui affiche un formulaire pour suggérer une
nouvelle formation.
3. Une route POST /ajouter-formation pour recevoir les données du formulaire et
enregistrer la suggestion dans la base de données.
4. Une route GET /recherche-formation qui permet de rechercher une formation
par titre ou nom de l’étudiant via un champ de recherche. Les résultats doivent
afficher les formations correspondantes.
Base de données:

● Nom de la base : formations_bdd
● Nom de la table : suggestions
● Colonnes obligatoires (au minimum) :
○ titre : texte, obligatoire.
○ description : texte, minimum 100 caractères, obligatoire.
○ etudiant : texte, obligatoire.
○ date_suggestion : date, ajoutée automatiquement.
ChatGPT a dit :
ChatGPT
Voici un guide pour créer l'application web demandée :

Étapes de développement
1. Configuration initiale
Installez Node.js et MySQL sur votre machine.
Créez un projet Node.js :
bash
Copier le code
mkdir formations-app
cd formations-app
npm init -y
Installez les dépendances nécessaires :
bash
Copier le code
npm install express express-handlebars mysql body-parser
2. Base de données
Créez la base de données formations_bdd et la table suggestions avec cette commande SQL :

sql
Copier le code
CREATE DATABASE formations_bdd;

USE formations_bdd;

CREATE TABLE suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL CHECK(CHAR_LENGTH(description) >= 100),
    etudiant VARCHAR(255) NOT NULL,
    date_suggestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. Structure du projet
Créez les dossiers suivants pour organiser les fichiers :

arduino
Copier le code
formations-app/
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── liste-formations.handlebars
│   ├── ajouter-formation.handlebars
│   ├── recherche-formation.handlebars
├── public/
│   └── css/ (optionnel pour le style)
├── app.js
4. Code principal (app.js)
Voici le fichier principal pour gérer les routes et connecter la base de données :

javascript
Copier le code
const express = require("express");
const exphbs = require("express-handlebars");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();

// Configuration Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Connexion à la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "votre_mot_de_passe",
  database: "formations_bdd",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

// Route GET /liste-formations
app.get("/liste-formations", (req, res) => {
  const sql = "SELECT * FROM suggestions ORDER BY date_suggestion DESC";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render("liste-formations", { formations: results });
  });
});

// Route GET /ajouter-formation
app.get("/ajouter-formation", (req, res) => {
  res.render("ajouter-formation");
});

// Route POST /ajouter-formation
app.post("/ajouter-formation", (req, res) => {
  const { titre, description, etudiant } = req.body;
  if (!titre || !description || description.length < 100 || !etudiant) {
    return res.send("Tous les champs sont obligatoires et la description doit avoir au moins 100 caractères.");
  }

  const sql = "INSERT INTO suggestions (titre, description, etudiant) VALUES (?, ?, ?)";
  db.query(sql, [titre, description, etudiant], (err) => {
    if (err) throw err;
    res.redirect("/liste-formations");
  });
});

// Route GET /recherche-formation
app.get("/recherche-formation", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.render("recherche-formation", { formations: [] });
  }

  const sql = "SELECT * FROM suggestions WHERE titre LIKE ? OR etudiant LIKE ?";
  db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) throw err;
    res.render("recherche-formation", { formations: results, query });
  });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
5. Templates Handlebars
views/layouts/main.handlebars
handlebars
Copier le code
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formations</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/liste-formations">Liste des formations</a>
    <a href="/ajouter-formation">Ajouter une formation</a>
    <a href="/recherche-formation">Rechercher une formation</a>
  </nav>
  {{{body}}}
</body>
</html>
views/liste-formations.handlebars
handlebars
Copier le code
<h1>Liste des formations suggérées</h1>
<ul>
  {{#each formations}}
  <li>
    <h2>{{this.titre}}</h2>
    <p>{{this.description}}</p>
    <p><strong>Proposé par :</strong> {{this.etudiant}}</p>
    <p><strong>Date :</strong> {{this.date_suggestion}}</p>
  </li>
  {{/each}}
</ul>
views/ajouter-formation.handlebars
handlebars
Copier le code
<h1>Ajouter une formation</h1>
<form action="/ajouter-formation" method="POST">
  <label>Titre : <input type="text" name="titre" required></label>
  <label>Description : <textarea name="description" required minlength="100"></textarea></label>
  <label>Nom de l'étudiant : <input type="text" name="etudiant" required></label>
  <button type="submit">Soumettre</button>
</form>
views/recherche-formation.handlebars
handlebars
Copier le code
<h1>Rechercher une formation</h1>
<form action="/recherche-formation" method="GET">
  <label>Rechercher : <input type="text" name="query"></label>
  <button type="submit">Chercher</button>
</form>

{{#if formations}}
<ul>
  {{#each formations}}
  <li>
    <h2>{{this.titre}}</h2>
    <p>{{this.description}}</p>
    <p><strong>Proposé par :</strong> {{this.etudiant}}</p>
    <p><strong>Date :</strong> {{this.date_suggestion}}</p>
  </li>
  {{/each}}
</ul>
{{else}}
<p>Aucun résultat trouvé.</p>
{{/if}}
Lancement de l'application
Démarrez le serveur Node.js :
bash
Copier le code
node app.js
Ouvrez un navigateur et accédez à http://localhost:3000.
