<?php

class Persistence {

	private static $instance;

	public static function getSingleton() {
		if (empty(self::$instance)) {
			self::$instance = new Persistence();
		}
		return self::$instance;
	}

	private $mc;

	public function __construct() {
		$this->mc = new Memcache;
		$this->mc->connect('localhost', 11211);

	}

	public function heartbeat($user) {
		$online = $this->mc->get('online');
		if (empty($online)) {			
			$online = array();
		}		
		$online[$user] = time();
		
		$this->mc->set('online', $online);
	}

	public function getOnlineUsers() {
		$online = $this->mc->get('online');
		if (empty($online)) {
			$online = array();
		}

		$writeback = false;
		foreach ($online as $user => $ts) {
			if ($ts + 5 < time()) {
				$writeback = true;
				unset($online[$user]);
			}
		}

		if ($writeback) {
			$this->mc->set('online', $online);
		}

		return array_keys($online);
	}

	public function getChat($user, $forUser) {
		if (strcmp($user, $forUser) < 0) {			
			$key = implode('-', array('chat', $user, $forUser));
		} else {
			$key = implode('-', array('chat', $forUser, $user));
		}
		$chat = $this->mc->get($key);
		if (empty($chat)) {
			$chat = array();
		}

		return $chat;
	}

	public function sendChat($user, $forUser, $msg) {
		if (strcmp($user, $forUser) < 0) {			
			$key = implode('-', array('chat', $user, $forUser));
		} else {
			$key = implode('-', array('chat', $forUser, $user));
		}
		$chat = $this->mc->get($key);
		if (empty($chat)) {
			$chat = array();
		}
		array_unshift($chat, $msg);
		$this->mc->set($key, $chat);

		return $chat;
	}	

}