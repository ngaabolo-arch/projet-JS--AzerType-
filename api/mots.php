<?php
header("Content-Type: application/json; charset=UTF-8");

// Sites autorisés à appeler cette API (CORS)
$autorises = ["https://ngaabolo-arch.github.io", "http://localhost"];
$origine = $_SERVER["HTTP_ORIGIN"] ?? "";
if (in_array($origine, $autorises)) {
    header("Access-Control-Allow-Origin: $origine");
}

require "connexion.php";

$mots = [];
$phrases = [];

$requete = $pdo->query("SELECT texte, type FROM propositions ORDER BY id");
foreach ($requete as $ligne) {
    if ($ligne["type"] === "mot") {
        $mots[] = $ligne["texte"];
    } else {
        $phrases[] = $ligne["texte"];
    }
}

echo json_encode(
    ["mots" => $mots, "phrases" => $phrases],
    JSON_UNESCAPED_UNICODE
);