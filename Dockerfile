FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN mkdir -p data

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/pills.json

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
