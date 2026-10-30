<?php
$hote = "localhost";
$base = "azertype";
$utilisateur = "root";
$motDePasse = "";

try {
    $pdo = new PDO(
        "mysql:host=$hote;dbname=$base;charset=utf8mb4",
        $utilisateur,
        $motDePasse,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erreur" => "Connexion à la base impossible"]);
    exit;
}