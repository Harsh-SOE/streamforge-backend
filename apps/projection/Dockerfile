FROM node:24-alpine AS base

WORKDIR /@streamforge

RUN apk add --no-cache curl bash
RUN curl -fL https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.4.21/grpc_health_probe-linux-amd64 -o /usr/local/bin/grpc_health_probe
RUN chmod +x /usr/local/bin/grpc_health_probe

COPY package.json yarn.lock ./

FROM base AS build-dependencies

RUN yarn install --frozen-lockfile --production=false

FROM base AS development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/projection ./apps/projection
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN chmod +x apps/projection/scripts/entrypoint.dev.bash

CMD ["apps/projection/scripts/entrypoint.dev.bash"]

FROM base AS builder

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/projection ./apps/projection
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN npx nest build projection

FROM base AS production-dependencies

RUN yarn install --frozen-lockfile --production=true

FROM base AS production

WORKDIR /@streamforge

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=base /@streamforge/package.json /@streamforge/yarn.lock ./
COPY --from=production-dependencies /@streamforge/node_modules ./node_modules
COPY --from=builder /@streamforge/dist/apps/projection/main.js ./main.js
COPY --from=builder /@streamforge/dist/apps/projection/scripts ./scripts
COPY --from=builder /@streamforge/dist/apps/projection/secrets ./secrets

USER root

RUN chmod +x scripts/entrypoint.prod.bash

USER node

CMD ["node", "main"]