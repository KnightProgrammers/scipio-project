FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g npm
WORKDIR /app
COPY /server/src ./server
COPY /db-seed/package.json  ./db-seed/
COPY /db-seed/package-lock.json ./db-seed/
RUN cd ./db-seed && npm ci

FROM node:20-alpine AS builder
RUN npm install -g npm
WORKDIR /app
COPY ./db-seed ./db-seed
COPY /server/src ./server/src
COPY --from=deps /app/db-seed/node_modules ./db-seed/node_modules
RUN cd ./db-seed && npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/app
RUN npm install -g npm
COPY --from=deps /app/db-seed/node_modules ./node_modules
COPY --from=builder /app/db-seed/dist ./dist
COPY ./db-seed/package.json ./
USER node
ENV NODE_ENV="production"
CMD ["npm", "start"]
