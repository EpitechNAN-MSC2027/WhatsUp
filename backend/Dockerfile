FROM node:lts-buster AS development
LABEL authors="germain"

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package.json /app
COPY package-lock.json /app

RUN npm install

# Get all the code needed to run the app
COPY . /app

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]

