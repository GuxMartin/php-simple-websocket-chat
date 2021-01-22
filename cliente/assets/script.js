// let host = "ws://127.0.0.1:5001";
// let host = "ws://192.168.10.10:5001";
let host = "ws://homestead.test:5001";

let socket;
let status_chat = 0;
let user = {
  "id": 0,
  "username": "",
};
let historial_salas = {};
let sala_actual = '';


$( document ).ready(function() {
  if(! $("#form_conexion input[name=host]").val().length){
    $("#form_conexion input[name=host]").val(host);
  }
  crear_sala('sala_publica', 'SALA PÚBLICA');
  cambiar_sala('sala_publica');
});// /document ready


/**
 * Inicializar WebSocket
 */
function init() {
  if (! "WebSocket" in window){ alert("WebSocket NO soportado por tu navegador :("); return; }
  try{
    socket = new WebSocket(host);
    socket.onopen = msg => set_chat(1);
    socket.onerror = e => alert("No se pudo conectar");
    socket.onmessage = msg => process_server_msg(msg);
    socket.onclose = e => set_chat(0);
  }// /try
  catch(ex){ console.error("Error variado:", ex); }
}// /init()


/**
 * Procesar mensaje de servidor
 * @param  {string} msg
 */
function process_server_msg(msg){
  let json;
  try {
    json = JSON.parse(msg.data);
  }catch(e){ console.log(e); alert(msg.data); return; }
  if(! json.opcion){ alert("ERROR: " + msg.data); return; }

  switch (json.opcion) {

    case 'bienvenida':
      console.log(json.mensaje);
      user.id = json.id;
      // una vez enterado de la bienvenida, registrar el nombre del usuario, que le devolverá la lista de usuarios
      send_json({opcion: 'registrar_usuario', username: user.username});
    break;// /bienvenida

    case 'lista_usuarios':
      // por si se reconectara, borrar todos los items, menos la pública
      $("#lista_salas a").each(function(i){
        if( $(this).prop('id') != "sala_publica" ){
          $(this).remove();
        }
      });
      for(let i in json.usuarios){
        if(i == user.id){ continue; }
        crear_sala(i, json.usuarios[i]);
      }
    break;

    case 'nuevo_usuario':
      crear_sala(json.id, json.username);
    break;

    case 'usuario_exit':
      $("#"+json.id).remove();
      // TODO: borrar de historial_salas
    break;

    case 'nuevo_mensaje':
      let sala = json.id_destino == "sala_publica" ? "sala_publica" : (json.id_origen == user.id ? json.id_destino : json.id_origen);
      historial_salas[sala].mensajes.push(json);
      if(sala == sala_actual){
        chat_append(json);
        scroll_bottom();
      }
      else{
        update_badge(sala);
      }
    break;// /nuevo_mensaje

    default: alert("Opcion no conocida: " + json.opcion); break;

  }// /switch
}// /process_server_msg


/**
 * Establece el estado del chat y los datos del usuario. Crea la conexión webSocket.
 * Si ya existía conexión, la desconecta
 */
function crear_conexion(){
  if(status_chat){ set_chat(0); return; }
  user.username = $("#form_conexion input[name=username]").val();
  if(! user.username.length){ alert("Escriba el nombre de usuario"); return; }
  host = $("#form_conexion input[name=host]").val();
  if(! host.length){ alert("Escriba la dirección de conexión"); return; }
  init();
}// /crear_conexion


/**
 * Establece el estado de la conexión. Cambia visualmente algunos aspectos
 * @param {boolean} active
 */
function set_chat(active){
  if(active){
    $("#btn-status").text("Conectado").removeClass("btn-outline-danger").addClass("btn-outline-success");
    $("#lista_salas").css('opacity', 1);
    $("#chat_container").css('opacity', 1);
    $("#form_conexion button[type=submit]").text('Desconectar').removeClass("btn-success").addClass("btn-outline-warning");
  }
  else{
    if(socket != null){
      socket.close();
      socket = null;
    }
    $("#btn-status").text("Desconectado").removeClass("btn-outline-success").addClass("btn-outline-danger");
    $("#lista_salas").css('opacity', 0.5);
    $("#chat_container").css('opacity', 0.5);
    $("#form_conexion button[type=submit]").text('Conectar').removeClass("btn-outline-warning").addClass("btn-success");
  }
  $("#mensaje").prop('disabled', !active);
  $("#form_conexion input[name=host]").prop('disabled', active);
  $("#form_conexion input[name=username]").prop('disabled', active);
  status_chat = active;
}// /set_chat


/**
 * Envía mensaje en json por el socket
 * @param  {json} json
 */
function send_json(json){
  json = JSON.stringify(json);
  try{
    socket.send(json);
  } catch(ex) {
    console.log(ex);
  }
}// /send_json


/**
 * Lee lo que esté en el input de mensaje y lo envía
 */
function enviar_mensaje(){
  if(! status_chat){ return; }
  let mensaje = $("#mensaje").val();
  if(mensaje.length < 1){ return; }
  $("#mensaje").val("");
  send_json({opcion: 'mensaje', sala_destino: sala_actual, mensaje: mensaje, username: user.username})
}// /enviar_mensaje


/**
 * Crea registro de historial de salas de tal id
 * @param  {string} id
 */
function crear_sala(id, username){
  $("#lista_salas").append(`<a href="javascript:cambiar_sala('${id}');" id="${id}" class="list-group-item list-group-item-action">${username}<span class="badge badge-danger badge-pill float-right invisible">0</span></a>`);
  historial_salas[id] = {
    "no_leidos": 0,
    "mensajes": [],
  };
}// /crear_sala


/**
 * Borra la actual conversació y carga el historial de esa sala
 * @param  {string} sala  Identificador de la sala
 */
function cambiar_sala(sala){
  if(sala == sala_actual){ return; }
  sala_actual = sala;
  $("#lista_salas a").removeClass("active");
  $(`#${sala}`).addClass("active");
  $("#chat_container").html("");
  for(let i in historial_salas[sala].mensajes){
    chat_append(historial_salas[sala].mensajes[i]);
  }
  scroll_bottom();
  update_badge(sala, true);
}// /cambiar_sala


/**
 * Crea una caja de mensaje
 * @param  {json} msj
 */
function chat_append(json){
  let fecha = new Date(json.fecha).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'medium' });
  $("#chat_container").append(`
    <div class="media">
      <img class="mr-3" src="img/user.png" alt="" height="65">
      <div class="media-body">
        <h5 class="mt-0 text-muted">
          ${json.username}
          <small>${fecha}</small>
        </h5>
        ${json.mensaje}
      </div>
    </div>
  `);
}// /chat_append


/**
 * Actualiza el contador de la sala
 * @param  {string}  sala
 * @param  {boolean} reset
 */
function update_badge(sala, reset){
  reset = reset || false;
  historial_salas[sala].no_leidos = reset ? 0 : historial_salas[sala].no_leidos + 1;
  $(`#${sala} .badge`)
    .text(historial_salas[sala].no_leidos)
    .toggleClass('invisible', !historial_salas[sala].no_leidos);
}// /update_badge


/**
 * Recorre la caja de conversación actual al final
 */
function scroll_bottom(){
  $('#chat_container').scrollTop($('#chat_container')[0].scrollHeight);
}// /scroll_bottom
