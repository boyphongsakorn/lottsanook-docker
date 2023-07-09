#Use and existing docker image as a base
FROM node:lts-alpine
RUN apk add --no-cache font-noto-thai && apk add --no-cache libevent libevent-dev chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.11/community
WORKDIR '/app'
#COPY package*.json ./
#RUN npm install
#COPY . .

RUN npm install -g pnpm
COPY package*.json ./
COPY pnpm-*.yaml ./
# RUN pnpm fetch --prod
ADD . ./
# RUN pnpm install -r --offline --prod
RUN pnpm install --no-frozen-lockfile

CMD ["npm","run","dev"]
