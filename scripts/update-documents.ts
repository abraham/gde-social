import * as admin from 'firebase-admin';
import * as v0 from './updates/v0';
import * as v1 from './updates/v1';

const versions = [v0, v1];
const CURRENT_VERSION = versions[versions.length -1].VERSION;

admin.initializeApp();

const db = admin.firestore();

async function updateAll() {
  const query = await db.collection('statuses').where('version', '<', CURRENT_VERSION).get();
  let skipped = 0;
  let migrated = 0;

  query.forEach(doc => {
    const data = doc.data();
    const update = versions.reduce((update, updater) => {
      if (update.document.version === undefined || update.document.version < updater.VERSION) {
        return { updated: true, document: updater.apply(update.document) };
      } else {
        return update;
      }
    }, { updated: false, document: data});

    if (update.updated) {
      migrated++;
      db.collection('statuses').doc(doc.id).set(update.document)
        .catch(error => {
          console.error(`ERROR saving ${doc.id}, ${error}`);
        });
    } else {
      skipped++;
    }
  });

  console.log(`Migrated ${migrated}`);
  console.log(`Skipped ${skipped}`);
}

updateAll();
