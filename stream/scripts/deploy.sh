gcloud compute ssh stream --command 'mkdir stream'
gcloud compute scp ./*.ts ./*.json ../.runtimeconfig.json stream:~/stream/
# gcloud compute instances reset stream
