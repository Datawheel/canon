# starting point: an image of node-12
FROM node:12-alpine

# install pnpm
RUN npm i -g pnpm@6.7.4

# create the app directory inside the image
WORKDIR /usr/src/app

# install app dependencies from the files package.json and package-lock.json
# installing before transfering the app files allows us to take advantage of cached Docker layers

# transfer all the app files to the working directory
COPY ./ ./

# change path into examples folder
WORKDIR /usr/src/app/examples

# run package installation
RUN pnpm install

# transfer all the app files to the working directory
# COPY examples/ ./

# build the app
RUN pnpm run build

# expose the required port
EXPOSE 3300

# start the app on image startup
CMD ["pnpm", "run", "start"]
