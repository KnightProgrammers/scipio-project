FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g npm
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
ARG APP_ENV
RUN npm install -g npm
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build:ts

FROM node:20-alpine AS runner
WORKDIR /usr/app
ARG APP_ENV
RUN npm install -g npm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --omit dev
USER node
ENV NODE_ENV="production"
CMD ["npm", "start"]
