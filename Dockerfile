FROM node:12.18.2

ADD ./ /authentication_microservice

WORKDIR /authentication_microservice

RUN npm install
RUN npm run build

WORKDIR /authentication_microservice

CMD ["npm", "start"]
