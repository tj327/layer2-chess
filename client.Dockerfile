FROM node:current-alpine

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV REACT_APP_SERVER_URL=http://localhost:9000
COPY ./client . 

WORKDIR /client

RUN npm install

CMD ["npm", "start","--","--no-interactive"]

EXPOSE 3000
