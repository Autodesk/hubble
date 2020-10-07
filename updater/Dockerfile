# Run the Hubble updater with Docker

FROM python:alpine

# Set environment variables
ENV APP_HOME /hubble-updater

# Create a directory for our application
# and set it as the working directory
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

# Copy over our application code
ADD reports $APP_HOME/reports
ADD scripts $APP_HOME/scripts
ADD ./check-schema.py ./helpers.py ./schema.py ./update-stats.py $APP_HOME/

# Install dependencies
RUN apk add --no-cache git openssh-client

# Run the app
CMD ["python3", "update-stats.py"]
