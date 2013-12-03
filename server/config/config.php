<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

function my_autoloader($class) {
    if (file_exists(__DIR__ . '/../classes/' . $class . '.class.php')) {
    	require_once(__DIR__ . '/../classes/' . $class . '.class.php');
    }
}

spl_autoload_register('my_autoloader');