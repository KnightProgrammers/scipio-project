FROM node:20-alpine as builder
WORKDIR /app
RUN npm install -g npm
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine as runner
WORKDIR /app
COPY --from=builder /app/build /usr/share/nginx/html
ENV NODE_ENV=production
EXPOSE 80
