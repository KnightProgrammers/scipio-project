FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g npm
WORKDIR /app
COPY ./models ./models
RUN cd ./models && npm ci && npm run build
COPY /db-seed/package.json  ./db-seed/
COPY /db-seed/package-lock.json ./db-seed/
RUN cd ./db-seed && npm ci
COPY ./db-seed ./db-seed
RUN cd ./db-seed && npm run build

FROM node:20-alpine AS runner
WORKDIR /app/db-seed
RUN npm install -g npm
COPY --from=deps /app/db-seed/node_modules /app/db-seed/node_modules
COPY --from=deps /app/db-seed/dist /app/db-seed/dist
COPY --from=deps /app/models /app/models
COPY ./db-seed/package.json /app/db-seed/
USER node
ENV NODE_ENV="production"
CMD ["npm", "start"]
