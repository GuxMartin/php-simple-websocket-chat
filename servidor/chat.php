#!/usr/bin/env php
<?php

// https://github.com/ghedipunk/PHP-Websockets

require_once('./PHP-Websockets-master/websockets.php');

class chat_server extends WebSocketServer {
  //protected $maxBufferSize = 1048576; //1MB... overkill for an echo server, but potentially plausible for other applications.

  private $usuarios = [];

  protected function process ($user, $message) {
    // echo           imprime en consola
    // $this->send    manda mensajes a usuarios

    try{
      $json_recibido = json_decode($message, false, 512, JSON_THROW_ON_ERROR);
    }
    catch (\JsonException $exception){ $this->send($exception->getMessage()); return; }
    if(! $json_recibido || json_last_error() !== JSON_ERROR_NONE){ $this->send($user,'Error JSON'); return; }
    if(! isset($json_recibido->opcion)){ $this->send($user,'opcion no encontrada'); return; }

    switch ($json_recibido->opcion) {

      case 'registrar_usuario':
        echo "NUEVO USUARIO RECIBIDO: ".$json_recibido->username."\n";

        $this->usuarios[$user->id] = $json_recibido->username;
        // echo print_r($this->usuarios, 1);

        $this->send($user,json_encode([
          "opcion" => "lista_usuarios",
          "usuarios" => $this->usuarios,
        ]));

        $this->broadcast([
          "opcion" => "nuevo_usuario",
          "id" => $user->id,
          "username" => $json_recibido->username,
        ]);
      break;// /registrar_usuario

      case 'mensaje':
        $mensaje_arr = [
          "opcion" => 'nuevo_mensaje',
          "id_origen" => $user->id,
          "id_destino" => $json_recibido->sala_destino,
          "username" => $json_recibido->username,
          "mensaje" => $json_recibido->mensaje,
          "fecha" => date("c"),
        ];
        if($json_recibido->sala_destino == 'sala_publica'){
          $this->broadcast($mensaje_arr);
        }
        else{
          $this->send($this->users[$json_recibido->sala_destino], json_encode($mensaje_arr));
          $this->send($this->users[$user->id], json_encode($mensaje_arr));
        }
      break;// /mensaje

      default: $this->send($user,'Opcion no válida'); break;

    }// /switch
  }// /process


  protected function connected($user){
    $this->send($user, json_encode([
      "opcion" => "bienvenida",
      "mensaje" => 'Bienvenido!',
      "id" => $user->id,
    ]));
  }// /connected

  protected function closed($user){
    // echo print_r($user,1);
    unset($this->usuarios[$user->id]);

    $this->broadcast([
      "opcion" => "usuario_exit",
      "id" => $user->id,
    ]);
  }// /closed


  /**
   * Transmitir a todos los usuarios conectados
   * @param  string $msg
   */
  private function broadcast($msg){
    $type = gettype($msg);
    if($type == "array"){
      $msg = json_encode($msg);
    }
    foreach($this->users as $user_){
      $this->send($user_, $msg);
    }// /foreach
  }// /broadcast

}// class chat_server

//$echo = new chat_server("0.0.0.0","9000");
$echo = new chat_server("127.0.0.1","5001");
// $echo = new chat_server("192.168.10.10","5001");

try {
  $echo->run();
}
catch (Exception $e) {
  $echo->stdout($e->getMessage());
}
