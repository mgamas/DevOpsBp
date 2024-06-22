# Image Node.js 18.15.0
FROM node:18.15.0

# Workdir container
WORKDIR /app

# copy configuration
COPY package*.json ./

# Dependency install
RUN npm install

# Cp app to container
COPY . .

# ENV production
ENV NODE_ENV=production

# not root user added
RUN useradd --user-group --create-home --shell /bin/false appuser

# giving acces to user
RUN chown -R appuser:appuser /app

# change to non user root
USER appuser

# Port expose
EXPOSE 8000

# healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8000 || exit 1

# run app
CMD ["node", "index.js"]
