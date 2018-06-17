import { Status, convertDate, parseHashtags } from './twitter';

export function parseTweet(status: Status) {
  const createdAt = convertDate(status.created_at);
  const hashtags = parseHashtags(status)
    .reduce((sortableHashtags: any, hashtag: string) => {
    sortableHashtags[hashtag] = createdAt;
    return sortableHashtags;
  }, {});
  const hasLinks = status.entities.urls.length > 0;

  return {
    createdAt,
    data: JSON.stringify(status),
    hashtags,
    hasLinks,
    updatedAt: Date.now(),
  }
}
