#Use and existing docker image as a base
FROM node:lts-alpine
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
