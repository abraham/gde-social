import { parseHashtags } from '../../functions/src/twitter';


export const VERSION = 1;

export function apply(document: FirebaseFirestore.DocumentData) {
  document['hashtags'] = parseHashtags(JSON.parse(document.data))
    .reduce((hashtags: any, hashtag: string) => {
    hashtags[hashtag] = document.createdAt;
    return hashtags;
  }, {});

  return {
    ...document,
    version: VERSION,
  };
}
