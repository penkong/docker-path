FROM node:10-slim

EXPOSE 3000
# RUN mkdir app && chown -R node:node .
WORKDIR /node

COPY package*.json ./

RUN npm install && npm cache clean --force

WORKDIR /node/app

COPY . .

CMD ["node", "app.js"]
