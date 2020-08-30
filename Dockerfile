FROM node:12.18.2

ADD ./ /jwt_authentication_microservice

WORKDIR /jwt_authentication_microservice

# install
RUN npm install

# build application
RUN npm run build

WORKDIR /jwt_authentication_microservice

CMD ["npm", "run", "start:prod"]
