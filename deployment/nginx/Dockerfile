# Set nginx base image
FROM nginx:latest

MAINTAINER ado

WORKDIR /
ADD nginx.conf /
ADD ssl/*.crt /etc/ssl/certs/
ADD ssl/*.key /etc/ssl/private/
ADD start.sh /
RUN chmod +x start.sh
