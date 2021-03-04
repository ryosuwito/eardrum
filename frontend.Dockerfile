# Dockerfile for deployment
FROM python:3.6-slim

RUN apt-get update && apt-get install -y nodejs npm

RUN mkdir -p /usr/src/app

COPY frontend /usr/src/app/frontend
WORKDIR /usr/src/app/frontend
RUN npm install
RUN npm run build
