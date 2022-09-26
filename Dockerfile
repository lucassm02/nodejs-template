# BUILD STAGE
FROM node:16.17.0-slim as builder

WORKDIR /home/node/app

COPY package.json .
RUN npx handpick@3.2.1 --target=buildDependencies --manager=yarn

COPY --chown=node:node . .
RUN yarn build

# RUN STAGE
FROM node:16.17.0-slim
LABEL maintainer="Santos <lucas.santos@pagtel.com.br>"

WORKDIR /home/node/app
RUN chown node:node /home/node/app

COPY package.json .
RUN yarn install --production=true

USER node

COPY --from=builder /home/node/app/dist ./dist
RUN mkdir -p ./log/error

EXPOSE ${PORT}

CMD ["yarn", "server:start"] 
