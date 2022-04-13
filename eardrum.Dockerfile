# Dockerfile for deployment
FROM python:3.6-slim

RUN mkdir -p /usr/src/app

COPY requirements.txt /usr/src/app/
WORKDIR /usr/src/app
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=eardrum-frontend /usr/src/app/frontend/build /usr/src/app/frontend/build
COPY --from=eardrum-frontend /usr/src/app/frontend/webpack-stats* /usr/src/app/frontend/

COPY . /usr/src/app
WORKDIR /usr/src/app
