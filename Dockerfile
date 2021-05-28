#Use and existing docker image as a base
#!/usr/bin/env bash
FROM node:alpine
WORKDIR '/app'
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm","run","dev"]