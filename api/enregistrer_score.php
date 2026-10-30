<?php
header("Content-Type: application/json; charset=UTF-8");

$autorises = ["https://ngaabolo-arch.github.io", "http://localhost"];
$origine = $_SERVER["HTTP_ORIGIN"] ?? "";
if (in_array($origine, $autorises)) {
    header("Access-Control-Allow-Origin: $origine");
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["erreur" => "Méthode non autorisée"]);
    exit;
}

require "connexion.php";

$pseudo = trim($_POST["pseudo"] ?? "");
$score = filter_var($_POST["score"] ?? null, FILTER_VALIDATE_INT);
$total = filter_var($_POST["total"] ?? null, FILTER_VALIDATE_INT);
$mode = $_POST["mode"] ?? "";

if (
    $pseudo === "" || mb_strlen($pseudo) > 20 ||
    $score === false || $total === false ||
    $total < 1 || $total > 100 ||
    $score < 0 || $score > $total ||
    !in_array($mode, ["mot", "phrase"])
) {
    http_response_code(400);
    echo json_encode(["erreur" => "Données invalides"]);
    exit;
}

$requete = $pdo->prepare(
    "INSERT INTO scores (pseudo, score, total, mode) VALUES (?, ?, ?, ?)"
);
$requete->execute([$pseudo, $score, $total, $mode]);

echo json_encode(["ok" => true]);