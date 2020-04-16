FROM node:12.2.0-alpine

MAINTAINER togglecorp info@togglecorp.com

WORKDIR /code

COPY ./package.json /code/package.json
RUN yarn install --network-concurrency 1

COPY . /code/
