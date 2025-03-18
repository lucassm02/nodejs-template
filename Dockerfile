FROM node:20.17.0-slim AS builder

WORKDIR /home/node/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn build

FROM node:20.17.0-slim
LABEL maintainer="Santos <lucassm02@gmail.com.br>"

ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

COPY --from=builder --chown=node:node /home/node/app/dist ./dist

RUN mkdir -p log && chown -R node:node log

USER node

ENTRYPOINT ["node", "dist/main"]
