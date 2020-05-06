FROM node:10.15-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80

CMD ["node", "build/index.js"]
