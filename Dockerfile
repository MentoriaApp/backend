FROM node:11
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
ENV PORT 80
COPY . .
EXPOSE 80
CMD ["yarn", "start"]
