# Dockerfile for deployment
FROM python:3.6-slim

RUN apt-get update && apt-get install -y nodejs npm

RUN mkdir -p /usr/src/app

COPY requirements.txt /usr/src/app/
WORKDIR /usr/src/app
RUN pip install -r requirements.txt

COPY frontend /usr/src/app/frontend
WORKDIR /usr/src/app/frontend
RUN npm install && npm run build && rm -rf node_modules

COPY . /usr/src/app
WORKDIR /usr/src/app
