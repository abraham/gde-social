import * as admin from 'firebase-admin';

const fromProjectId = 'gde-social';
const toProjectId = 'gde-social-dev';
const limit = 100;

const fromApp = admin.initializeApp({ projectId: fromProjectId }, 'from');
const fromDb = fromApp.firestore();

const toApp = admin.initializeApp({ projectId: toProjectId }, 'to');
const toDb = toApp.firestore();

console.log(`Copying from ${fromProjectId} to ${toProjectId}`);

async function copy() {
  const collections = await fromDb.getCollections();
  for (const collection of collections) {
    const snapshots = await collection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    console.log(`Copying ${snapshots.size} ${collection.id} documents`);
    const batch = toDb.batch();
    snapshots.forEach((document) => {
      batch.set(
        toDb.collection(collection.id).doc(document.id),
        document.data(),
      );
    });
    batch.commit();
  }
}

copy();
