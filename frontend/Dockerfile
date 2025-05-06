# Use Node.js official image as the base image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Command to start the React app
CMD ["npm", "start"]

