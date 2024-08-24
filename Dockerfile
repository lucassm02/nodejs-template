# BUILD STAGE
FROM node:20.17.0-slim AS builder

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN npx handpick --target=buildDependencies --manager=yarn

COPY --chown=node:node . .
RUN yarn build

# RUN STAGE
FROM node:20.17.0-slim
LABEL maintainer="Santos <lucassm02@gmail.com.br>"

ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /home/node/app
RUN chown node:node /home/node/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

USER node

COPY --from=builder /home/node/app/dist ./dist

RUN mkdir -p ./log

ENTRYPOINT ["node", "dist/main"] 