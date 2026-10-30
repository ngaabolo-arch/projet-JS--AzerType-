// Adresse de l'API PHP (relative : fonctionne sur WAMP).
// Quand l'API sera sur un hébergeur en ligne, on mettra son adresse complète ici.
const URL_API = "api/mots.php";

const URL_ENREGISTRER = "api/enregistrer_score.php";
const URL_CLASSEMENT = "api/classement.php";

let listeMot = [
    "Cachalot", "petunia", "Serviette", "clavier", "ordinateur",
    "projet", "variable", "fonction", "boucle", "tableau",
    "navigateur", "fichier", "dossier", "reseau", "programme"
];

let listePhrase = [
    "la vie est belle",
    "pas de panique",
    "un morceau de poisson",
    "chaque erreur est une lecon",
    "la pratique rend parfait",
    "le code propre est plus facile a lire",
    "il faut taper vite et sans faute",
    "apprendre un peu chaque jour",
    "rien ne sert de courir"
];