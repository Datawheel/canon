# starting point: an image of node-12
FROM node:12-alpine

# install pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# create the app directory inside the image
WORKDIR /usr/src/app

# install app dependencies from the files package.json and package-lock.json
# installing before transfering the app files allows us to take advantage of cached Docker layers
COPY examples/package*.json ./

# RUN pnpm install

# if you are building your code for production
RUN pnpm install --frozen-lockfile --prod

# transfer all the app files to the working directory
COPY examples/ ./

# build the app
RUN pnpm run build

# expose the required port
EXPOSE 3300

# start the app on image startup
CMD ["pnpm", "run", "start"]
