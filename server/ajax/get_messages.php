<?php

require_once(__DIR__ . '/../config/config.php');

$user = $_POST['user'];
$forUser = $_POST['forUser'];

$p = Persistence::getSingleton();
$chat = $p->getChat($user, $forUser);

echo json_encode(array('result' => true, 'chat' => $chat));