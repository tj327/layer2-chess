FROM node:current-alpine

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV REACT_APP_SERVER_URL=http://10.1.0.3:9000
COPY ./client . 

WORKDIR /client

RUN npm install

CMD ["npm", "start"]

EXPOSE 3000
