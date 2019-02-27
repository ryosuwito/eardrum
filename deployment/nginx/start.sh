#!/usr/bin/env bash
envsubst '${NGINX_CRT_NAME} ${NGINX_KEY_NAME} ${NGINX_SERVER_NAME}' < nginx.conf > /etc/nginx/nginx.conf

nginx -g "daemon off;"
