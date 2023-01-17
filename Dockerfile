# BUILD STAGE
FROM node:18.13.0-slim as builder

WORKDIR /home/node/app

COPY package.json .
RUN npx handpick --target=buildDependencies --manager=yarn

COPY --chown=node:node . .
RUN yarn build

# RUN STAGE
FROM node:18.13.0-slim
LABEL maintainer="Santos <lucas.santos@pagtel.com.br>"

ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /home/node/app
RUN chown node:node /home/node/app

COPY package.json .
RUN yarn install --production=true

USER node

COPY --from=builder /home/node/app/dist ./dist
RUN mkdir -p ./log

ENTRYPOINT ["node", "dist/main"] 