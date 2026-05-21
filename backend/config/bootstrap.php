<?php
require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Validate that required variables are present
$dotenv->required([
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_EXPIRY',
    'ENCRYPTION_KEY',
])->notEmpty();
?>