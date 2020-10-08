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
ADD ./*.py $APP_HOME/
ADD ./entrypoint.sh ./*.py $APP_HOME/

# Install dependencies
RUN apk add --no-cache git openssh-client

# Configure job to run every 24h at at 8am. This is a bit after GHES daily
# logrotate run at 6:25 and ensures we have the latest `.log.1` files available.
# Attention: stderr seems not be redirect to the Docker console and I wasn't
# able to make this work.
RUN echo "0 8 * * * python3 $APP_HOME/update-stats.py" >/etc/crontabs/root

# Run cron on container startup
CMD [ "/hubble-updater/entrypoint.sh" ]
