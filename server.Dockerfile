FROM node:current-alpine

WORKDIR /app

COPY ./server /app

RUN npm install

CMD ["npm", "start"]
