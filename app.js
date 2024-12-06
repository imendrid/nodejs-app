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

// Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "formations_bdd",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à MySQL");
});

// Routes
// Afficher la liste des formations
app.get("/liste-formations", (req, res) => {
  db.query("SELECT * FROM suggestions ORDER BY date_suggestion DESC", (err, results) => {
    if (err) throw err;
    res.render("liste-formations", { formations: results });
  });
});

// Formulaire pour ajouter une formation
app.get("/ajouter-formation", (req, res) => {
  res.render("ajouter-formation");
});

// Ajouter une nouvelle formation
app.post("/ajouter-formation", (req, res) => {
  const { titre, description, etudiant } = req.body;
  if (!titre || !description || description.length < 100 || !etudiant) {
    return res.send("Tous les champs sont obligatoires et la description doit comporter au moins 100 caractères.");
  }

  const sql = "INSERT INTO suggestions (titre, description, etudiant) VALUES (?, ?, ?)";
  db.query(sql, [titre, description, etudiant], (err) => {
    if (err) throw err;
    res.redirect("/liste-formations");
  });
});

// Rechercher des formations
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

// Démarrer le serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
