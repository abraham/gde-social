import * as admin from 'firebase-admin';

import { buildStatus, version } from '../functions/src/status';

admin.initializeApp();

const db = admin.firestore();

async function updateAll() {
  // TODO: paginate https://firebase.google.com/docs/firestore/query-data/query-cursors#paginate_a_query
  const query = await db.collection('statuses').where('version', '<', version).get();
  let skipped = 0;
  let migrated = 0;

  query.forEach(doc => {
    const data = doc.data();
    const document = buildStatus(data.data);
    migrated++;
    db.collection('statuses').doc(doc.id).set(document)
      .catch(error => {
        console.error(`ERROR saving ${doc.id}, ${error}`);
      });
  });

  console.log(`Migrated ${migrated}`);
  console.log(`Skipped ${skipped}`);
}

updateAll();
