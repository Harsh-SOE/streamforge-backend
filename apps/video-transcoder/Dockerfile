FROM node:24-alpine AS base

WORKDIR /@streamforge

RUN apk add --no-cache ffmpeg curl bash

COPY package.json yarn.lock ./

FROM base AS build-dependencies

RUN yarn install --frozen-lockfile --production=false

FROM base AS development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/video-transcoder ./apps/video-transcoder
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN chmod +x apps/video-transcoder/scripts/entrypoint.dev.bash

ENTRYPOINT [ "apps/video-transcoder/scripts/entrypoint.dev.bash" ]

FROM base AS builder

COPY --from=build-dependencies /@streamforge/node_modules ./node_modules

COPY apps/video-transcoder ./apps/video-transcoder
COPY libs ./libs
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN npx nest build video-transcoder

FROM base AS production-dependencies

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM base AS production

WORKDIR /@streamforge

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=base /@streamforge/package.json /@streamforge/yarn.lock ./
COPY --from=production-dependencies /@streamforge/node_modules ./node_modules
COPY --from=builder /@streamforge/dist/apps/video-transcoder/main.js ./main.js
COPY --from=builder /@streamforge/dist/apps/video-transcoder/scripts/entrypoint.prod.bash ./scripts/entrypoint.prod.bash

USER root

RUN mkdir /@streamforge/transcoded-videos
RUN chown -R node:node /@streamforge/transcoded-videos

USER node

CMD ["node", "main"]