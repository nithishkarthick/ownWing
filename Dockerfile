# Use the official Node.js image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies first
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your project files into the container
COPY . .

# Expose the port your app will run on (port 3000 in this case)
EXPOSE 3000

# Command to start the application
CMD ["node", "index.js"]
