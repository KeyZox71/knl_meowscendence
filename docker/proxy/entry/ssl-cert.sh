#!/bin/sh

if [ ! -f /etc/nginx/certs/fullchain.pem ] || [ ! -f /etc/nginx/certs/privkey.pem ]; then
  echo "Generating self-signed certs..."
  mkdir -p /etc/nginx/certs
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/privkey.pem \
    -out /etc/nginx/certs/fullchain.pem \
    -subj "/C=FR/ST=IDF/L=Angouleme/O=42/OU=42/CN=trans.kanel.ovh/UID=adjoly"
fi
