# Dockerfile for deployment
FROM node:10-buster as frontend

RUN mkdir -p /usr/src/app

COPY frontend/package.json /usr/src/app/frontend/package.json
WORKDIR /usr/src/app/frontend
RUN npm install

COPY frontend /usr/src/app/frontend
RUN npm run build
# Dockerfile for deployment

FROM python:3.6-slim

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /usr/src/app

RUN apt-get update
RUN apt-get install -y postfix

COPY requirements.txt /usr/src/app/
WORKDIR /usr/src/app
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=frontend /usr/src/app/frontend/build /usr/src/app/frontend/build
COPY --from=frontend /usr/src/app/frontend/webpack-stats* /usr/src/app/frontend/

COPY . /usr/src/app
WORKDIR /usr/src/app
