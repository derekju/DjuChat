<?php

require_once(__DIR__ . '/../config/config.php');

$user = $_POST['user'];
$forUser = $_POST['forUser'];
$msg = $_POST['msg'];

$p = Persistence::getSingleton();
$chat = $p->sendChat($user, $forUser, $msg);

echo json_encode(array('result' => true, 'chat' => $chat));