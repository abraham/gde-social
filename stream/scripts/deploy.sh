gcloud compute ssh stream --command 'mkdir -p stream'
gcloud compute scp ./*.ts ./*.json ../.runtimeconfig.json stream:~/stream/
# gcloud compute instances reset stream
