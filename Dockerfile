FROM php:7.4-apache
EXPOSE 80
EXPOSE 5001

RUN apt-get update 
RUN docker-php-ext-install sockets

VOLUME ["/var/www/html/index.php"]
VOLUME ["/var/www/html/cliente"]
VOLUME ["/var/www/html/servidor/"]

# Copy script to start php server websocket
COPY docker-container/srv/run_chat_server.sh /srv/run_chat_server.sh
# Set execution permissions for script
RUN chmod +x /srv/run_chat_server.sh
# Copy wrapper script
COPY docker-container/srv/wrapper_script.sh /srv/wrapper_script.sh
# Set execution permissions for script
RUN chmod +x /srv/wrapper_script.sh

# Change workign directory
WORKDIR /srv 
# Execute the wrapper script
CMD ./wrapper_script.sh
