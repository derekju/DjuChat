<?php

require_once(__DIR__ . '/../config/config.php');

$user = $_POST['user'];

$p = Persistence::getSingleton();
$p->heartbeat($user);
$online = $p->getOnlineUsers();

echo json_encode(array('result' => true, 'users' => $online));