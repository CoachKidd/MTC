FROM microsoft/azure-functions-runtime:v2.0.0-beta1
ARG storage_connection
ENV InboundStorageAccount=$storage_connection
ENV OutboundStorageAccount=$storage_connection
ENV AzureWebJobsStorage=$storage_connection
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
COPY . /home/site/wwwroot
