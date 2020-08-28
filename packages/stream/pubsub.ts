import { PubSub, Topic } from '@google-cloud/pubsub';

const projectId = process.env.GCLOUD_PROJECT_ID;
const pubsub = new PubSub({
  projectId,
});

export async function publish(statusId: string): Promise<boolean> {
  const topicName = `projects/${projectId}/topics/new_status`;
  await getTopicAndPublish(topicName, statusId);
  return true;
}

async function getTopicAndPublish(topicName: string, statusId: string) {
  const publisher = await getTopic(topicName);
  const data = Buffer.from(JSON.stringify({ statusId }));
  return publisher.publish(data).catch(() => {
    return createTopic(topicName)
      .then(() => getTopic(topicName))
      .then((publisher) => publisher.publish(data));
  });
}

async function getTopic(topicName: string): Promise<Topic> {
  return pubsub.topic(topicName);
}

async function createTopic(topicName: string): Promise<Topic> {
  const [topic] = await pubsub.createTopic(topicName);
  return topic;
}
