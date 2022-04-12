FROM node:14

WORKDIR /mmenu-web

COPY ./ /mmenu-web

RUN rm -rf node_modules

RUN npm i
CMD ["npm","run", "dev"]

EXPOSE 3000
