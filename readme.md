# PHP Simple WebSocket Chat

![Pantalla](https://github.com/jbvazquez/php-simple-websocket-chat/blob/master/cliente/img/pantallaso.jpg?raw=true)

Usa la librería https://github.com/ghedipunk/PHP-Websockets

## Características
* Sala pública
* Sala privada por usuario conectado
* Contador de mensajes sin leer por sala
* Contador de usuarios escribiendo por sala

## Manual

### Correr servidor

* Mover a la carpeta servidor `cd servidor`
* Opcional: editar parámetros en `chat.php`
* Ejecutar servidor `./chat.php` o `php chat.php`

### Correr en cliente
* Abrir cliente/index.html
* Modificar parámetros de servidor y nombre de usuario
* Conectar

---

### Vagrant Homestead

* Servidor: `$echo = new chat_server("192.168.10.10","5001");`
* En máquina host `myVirtualHost.test/php-simple-websocket-chat/cliente/index.html`

#### Túnel SSH para transmitir por red local
* Maquina host: `ssh -L (local host ip):5001:192.168.10.10:5001 vagrant@homestead.test`
* Máquina en red: `http://(local host ip):8000/php-simple-websocket-chat/cliente/index.html`

---
## [Docker](https://docs.docker.com/get-started/overview/)
### Windows
* Instalación oficial [Install Docker Desktop on Windows](https://docs.docker.com/docker-for-windows/install/)
* Docker Version:
	```
	Server: Docker Engine - Community
	Engine:
	Version:          20.10.2
	API version:      1.41 (minimum version 1.12)
	Go version:       go1.13.15
	Git commit:       8891c58
	Built:            Mon Dec 28 16:15:28 2020
	OS/Arch:          linux/amd64
	Experimental:     false
	containerd:
	Version:          1.4.3
	GitCommit:        269548fa27e0089a8b8278fc4fc781d7f65a939b
	runc:
	Version:          1.0.0-rc92
	GitCommit:        ff819c7e9184c13b7c2607fe6c30ae19403a7aff
	docker-init:
	Version:          0.19.0
	GitCommit:        de40ad0
	```
* [PHP Docker Official Images](https://hub.docker.com/_/php)
 * Tag: [7.4-apache](https://github.com/docker-library/php/blob/74175669f4162058e1fb0d2b0cf342e35f9c0804/7.4/buster/apache/Dockerfile)
 * Esta imagen contiene Apache httpd de Debian junto con PHP
 * PHP Version 7.4.14
 * Apache 2.0 Handler

### Creación de imagen PHP personalizada
* Cambiar el working directory a la raíz del proyecto `cd php-simple-websocket-chat`
* Correr `build_image.bat` o ejecutar el comando `run_chat_serverdocker build -t php-simple-websocket-chat .`
  * El batch file construye la Docker image leyendo las instrucciones del `Dockerfile`, en éste documento de texto (sin extensión) se ejecutan los comandos de instalación para las extensiones necesarias, la especificación para que el contenedor escuche los puertos a usar `80` y `5001`, así como la declaración de los directorios a montar, copia y cambio de permisos de los scripts, así como la ejecución del [wrapper](https://docs.docker.com/config/containers/multi-service_container/) usado para correr varios servicios al inicio del contenedor.
  * **Nota**:  La implementación del [wrapper](https://docs.docker.com/config/containers/multi-service_container/) fue necesaria debido a que `apachectl -D FOREGROUND` se ejecuta en primer plano. En otras palabras, bloquea la ejecución del script del servidor hasta que `apachectl` termina de ejecutarse.
  De otra manera puede ser, ejecutando el contenedor que inicia por defecto `apachectl -D FOREGROUND` y en otra sesión correr el servidor manualmente.
	#### Como correr el servidor manualmente
	* Correr `run_chat_server.bat` o ejecutar el comando `docker container exec -it php_container /srv/run_chat_server.sh`
	* Ejemplo de ejecución del servidor:
	```
		Server started
		Listening on: 172.17.0.2:5001
		Master socket: Resource id #6
	```

### Como correr el contenedor
* Cambiar el working directory a `cd docker-container`
* **Nota:** La ejecución del contenedor se realiza en modo interactivo `--interactive , -i` `--tty , -t`.
* Correr `run_container.bat` o ejecutar el comando:
	```
	docker run --rm -it ^
		-v %CD%/src/index.php:/var/www/html/index.php ^
		-v %CD%/../cliente/:/var/www/html/cliente/ ^
		-v %CD%/../servidor/:/var/www/html/servidor/ ^
		--expose 80 ^
		--expose 5001 ^
		-p 80:80 -p 5001:5001 ^
		--name php_container ^
		php-simple-websocket-chat
	```
	* Al terminar la ejecución del batch file ej. `Ctrl+C`, el contenedor se debe de borrar automáticamente, de lo contrario se puede eliminar manualmente desde el dashboard o usando el comando `docker container rm [container_id]`.
	* Cambiar el tamaño de la ventana de comandos puede detener el servidor Apache al recibir una señal [SIGWINCH](https://stackoverflow.com/questions/48086606/docker-container-exits-when-using-it-option).
		* Ejemplo de error:
		```
		[mpm_prefork:notice] [pid 1] AH00170: caught SIGWINCH, shutting down gracefully
		```
		La implementación de la ejecución del contenedor en segundo plano puede ser útil para este caso `--detach , -d` sin embargo, por defecto se usa el modo interactivo para depurar.
* Ejemplo de ejecución exitosa:
	```
	Server started
	Listening on: 172.17.0.2:5001
	Master socket: Resource id #6
	AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 172.17.0.2. Set the 'ServerName' directive globally to suppress this message
	AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 172.17.0.2. Set the 'ServerName' directive globally to suppress this message
	[Tue Jan 26 19:44:49.788786 2021] [mpm_prefork:notice] [pid 12] AH00163: Apache/2.4.38 (Debian) PHP/7.4.14 configured -- resuming normal operations
	[Tue Jan 26 19:44:49.788862 2021] [core:notice] [pid 12] AH00094: Command line: '/usr/sbin/apache2 -D FOREGROUND'
	```
### Como acceder a la terminal bin/bash del contenedor
* Correr `exec_container_bash.bat` o ejecuta el comando `docker container exec -it php_container /bin/bash`
  * [docker exec](https://docs.docker.com/engine/reference/commandline/exec/)

### Como acceder al cliente
* Desde el navegador acceder a la URL http://localhost/cliente/

### Obtener información de PHP
* Desde el navegador acceder a URL http://localhost/

### Linux
* Cambiar el working directory a la raíz del proyecto `cd php-simple-websocket-chat`
* Creación de la imagen:
```
docker build -t php-simple-websocket-chat .
```
* Correr contenedor
```
docker run --rm -it \
	-v "$(pwd)/cliente/":/var/www/html/cliente/ \
	-v "$(pwd)/servidor/":/var/www/html/servidor/ \
	-v "$(pwd)/src/index.php":/var/www/html/servidor/index.php \
	--expose 80 \
	--expose 5001 \
	-p 80:80 -p 5001:5001 \
	--name php_container \
	php-simple-websocket-chat
```
