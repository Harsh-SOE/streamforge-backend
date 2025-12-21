FROM node:24-alpine AS base

WORKDIR /@streamforge

RUN apk add --no-cache curl bash

COPY package.json yarn.lock ./

FROM base AS build-dependencies

RUN yarn install --frozen-lockfile --production=false

FROM base AS development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/email ./apps/email
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN chmod +x apps/email/scripts/entrypoint.dev.bash

ENTRYPOINT [ "apps/email/scripts/entrypoint.dev.bash" ]

FROM base AS builder

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/email ./apps/email
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN npx nest build email

FROM base AS production-dependencies

RUN yarn install --frozen-lockfile --production=true

FROM base AS production

WORKDIR /@streamforge

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /@streamforge

COPY --from=base /@streamforge/package.json /@streamforge/yarn.lock ./
COPY --from=production-dependencies /@streamforge/node_modules ./node_modules
COPY --from=builder /@streamforge/dist/apps/email/main.js ./main.js
COPY --from=builder /@streamforge/dist/apps/email/scripts/entrypoint.prod.bash ./scripts/entrypoint.prod.bash
COPY --from=builder /@streamforge/dist/apps/email/secrets ./secrets

USER root

RUN chmod +x scripts/entrypoint.prod.bash

USER node

CMD ["node", "main"]