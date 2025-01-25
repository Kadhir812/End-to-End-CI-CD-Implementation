# Use Node.js for building and running the app
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project source code
COPY . .

# Build the app
RUN npm run build

# Expose the port used by Vite
EXPOSE 5173

CMD ["npm", "run", "dev"]

