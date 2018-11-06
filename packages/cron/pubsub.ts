import * as PubSub from '@google-cloud/pubsub';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const pubsub = PubSub({
  projectId: process.env.GCLOUD_PROJECT
});
const TOPICS = ['five-minute-tick', 'fifteen-minute-tick', 'one-hour-tick', 'twenty-four-hour-tick'];

export async function publish(name: string): Promise<boolean> {
  if (!TOPICS.includes(name)) {
    console.log('Invalid topic', name);
    return false;
  }

  const topicName = buildTopicName(name);
  const result = await getTopicAndPublish(topicName);
  console.log('result', result);

  return true;
}

async function getTopicAndPublish(topicName: string) {
  const publisher = await getPublisher(topicName);
  const data = Buffer.from(JSON.stringify({ }));
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

function buildTopicName(name: string): string {
  return `projects/${projectId}/topics/${name}`;
}
