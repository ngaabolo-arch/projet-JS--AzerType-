<?php
header("Content-Type: application/json; charset=UTF-8");

$autorises = ["https://ngaabolo-arch.github.io", "http://localhost"];
$origine = $_SERVER["HTTP_ORIGIN"] ?? "";
if (in_array($origine, $autorises)) {
    header("Access-Control-Allow-Origin: $origine");
}

require "connexion.php";

$mode = $_GET["mode"] ?? "mot";
if (!in_array($mode, ["mot", "phrase"])) {
    $mode = "mot";
}

$requete = $pdo->prepare(
    "SELECT pseudo, score, total FROM scores
     WHERE mode = ?
     ORDER BY score / total DESC, date_partie ASC
     LIMIT 10"
);
$requete->execute([$mode]);

echo json_encode($requete->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);