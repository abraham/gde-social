import * as PubSub from '@google-cloud/pubsub';

const projectId = process.env.GCLOUD_PROJECT_ID;
const pubsub = PubSub({
  projectId,
});

export async function publish(statusId: string): Promise<boolean> {
  const topicName = `projects/${projectId}/topics/new_status`;
  await getTopicAndPublish(topicName, statusId);
  return true;
}

async function getTopicAndPublish(topicName: string, statusId: string) {
  const publisher = await getPublisher(topicName);
  const data = Buffer.from(JSON.stringify({ statusId }));
  return publisher.publish(data)
    .catch(() => {
      return createTopic(topicName)
        .then(() => getPublisher(topicName))
        .then(publisher => publisher.publish(data));
    });
}

async function getPublisher(topicName: string): Promise<PubSub.Publisher> {
  return getTopic(topicName)
    .then(topic => topic.publisher());
}

async function getTopic(topicName: string): Promise<PubSub.Topic> {
  return pubsub.topic(topicName)
}

async function createTopic(topicName: string): Promise<PubSub.Topic> {
  await pubsub.createTopic(topicName);
  return getTopic(topicName);
}
