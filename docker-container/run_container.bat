@echo off
docker run --rm -it ^
        -v %CD%/src/index.php:/var/www/html/index.php ^
	-v %CD%/../cliente/:/var/www/html/cliente/ ^
        -v %CD%/../servidor/:/var/www/html/servidor/ ^
        --expose 80 ^
        --expose 5001 ^
        -p 80:80 -p 5001:5001 ^
        --name php_container ^
        php-simple-websocket-chat
pause

