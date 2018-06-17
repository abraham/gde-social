import * as admin from 'firebase-admin';

import { buildStatus, version } from '../functions/src/status';

admin.initializeApp();

const db = admin.firestore();

async function migrate() {
  let next = true;
  let query = page();
  let migrated = 0;

  while (next) {
    const snapshot = await query.get();
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];
    console.log(`Updating ${snapshot.docs.length} documents`);

    const batch = db.batch();
    snapshot.forEach(document => {
      migrated++;
      batch.set(document.ref, buildStatus(JSON.parse(document.data().data)));
    });
    batch.commit();

    if (snapshot.docs.length === 0) {
      next = false;
    } else {
      query = page(lastDocument)
    }
  }

  console.log(`Migrated ${migrated}`);
}

function page(lastDocument?: FirebaseFirestore.QueryDocumentSnapshot): FirebaseFirestore.Query {
  let query =  db.collection('statuses')
    .orderBy('version')
    .orderBy('createdAt')
    .where('version', '<', version)
    .limit(500);

  if (lastDocument) {
    query = query.startAfter(lastDocument.data().version, lastDocument.data().createdAt);
  }

  return query;
}

migrate();
