#!/bin/bash
set -a #export all varibles
source .env
set +a

# Npw can Create PostgreSQL Flexible Server and DB using the imported variables
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $SERVER_NAME \
    --location $LOCATION \
    --admin-user $ADMIN_USER \
    --admin-password $ADMIN_PASSWORD \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 15 \
    --storage-size 32 \
    --public-access 0.0.0.0-255.255.255.255 \
    --yes

# Create a database inside the server
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $SERVER_NAME \
    --database-name $DB_NAME


#SKU defines the size and pricing tier (B -series = Bursatble VM, 1 vCPU, 2GB RAM) Use this if you want a dev-friendly, cheaper option (burstable VMs) - for dev and testing
#postgre version 15
#storage size in GB for the db serve
#This configures the firewall to allow connections from any IP address.
 #automatially confrims all promts
