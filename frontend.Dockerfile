# Dockerfile for deployment
FROM node:10-buster

RUN mkdir -p /usr/src/app

COPY frontend/package.json /usr/src/app/frontend/package.json
WORKDIR /usr/src/app/frontend
RUN npm install

COPY frontend /usr/src/app/frontend
RUN npm run build
