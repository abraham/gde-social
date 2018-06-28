gcloud compute instances create stream \
  --zone us-central1-a \
  --machine-type f1-micro \
  --image-family ubuntu-1804-lts \
  --image-project ubuntu-os-cloud \
  --metadata-from-file startup-script=scripts/startup.sh
