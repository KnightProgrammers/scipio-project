FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g npm
WORKDIR /app
COPY /models /app/models
RUN cd /app/models && npm ci && npm run build
COPY /server/package.json /server/package-lock.json /app/server/
RUN cd /app/server && npm ci
COPY /server/ /app/server/
RUN cd /app/server && ls && npm run build

FROM node:20-alpine AS runner
WORKDIR /app/server
ARG APP_ENV
RUN npm install -g npm
COPY --from=deps /app/server/node_modules /app/server/node_modules
COPY --from=deps /app/server/dist /app/server/dist
COPY --from=deps /app/models /app/models
COPY /server/package.json /app/server/
USER node
ENV NODE_ENV="test"
CMD ["npm", "start"]
