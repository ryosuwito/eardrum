# Dockerfile for deployment
FROM ubuntu:16.04

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y build-essential \
    libpq-dev libssl-dev libffi-dev python3-pip \
    curl && curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    apt-get clean
RUN mkdir -p /usr/src/app
COPY requirements.txt /usr/src/app/
COPY . /usr/src/app/
WORKDIR /usr/src/app/
