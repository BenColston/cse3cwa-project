FROM node:20-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

EXPOSE 4080

CMD ["sh", "-c", "npx prisma db push && npm run start"]
