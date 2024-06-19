FROM node:current-alpine

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY ./client . 

WORKDIR /client

RUN npm install

CMD ["npm", "start"]

EXPOSE 3000
