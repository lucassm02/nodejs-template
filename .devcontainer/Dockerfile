ARG VARIANT="24-trixie"
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

ENV TZ=America/Sao_Paulo

RUN apt-get update && apt-get upgrade -yq
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --chown=node:node ./assets /home/node

RUN chmod +x /home/node/entrypoint.sh
RUN /home/node/entrypoint.sh
