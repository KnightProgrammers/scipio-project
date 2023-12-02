FROM node:20-alpine AS deps
ARG GITHUB_TOKEN

ENV GITHUB_TOKEN=$GITHUB_TOKEN
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g npm
WORKDIR /app
COPY package.json package-lock.json ./
RUN echo //npm.pkg.github.com/:_authToken=$GITHUB_TOKEN >> ~/.npmrc
RUN echo @knightprogrammers:registry=https://npm.pkg.github.com/ >> ~/.npmrc
RUN npm ci
RUN echo > ~/.npmrc

FROM node:20-alpine AS builder
ARG APP_ENV
RUN npm install -g npm
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/app
ARG APP_ENV
RUN npm install -g npm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER node
CMD ["npm", "start"]
