import * as admin from 'firebase-admin';
import * as fs from 'fs';

admin.initializeApp();

const db = admin.firestore();

async function dump() {
  let next = true;
  let query = page();
  let dumped = 0;

  while (next) {
    const snapshot = await query.get();
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];
    snapshot.docs.forEach((doc) => {
      fs.writeFile(`data/${doc.id}.json`, doc.data().data, 'ascii', (error) => {
        if (error) {
          console.log(`Error writing ${doc.id}`);
          console.log(error);
        }
      });
      dumped++;
    });

    console.log(`Dumped ${snapshot.docs.length} of ${dumped} documents`);

    if (snapshot.docs.length === 0) {
      next = false;
    } else {
      query = page(lastDocument);
    }
  }

  console.log(`Dumped ${dumped}`);
}

function page(
  lastDocument?: FirebaseFirestore.QueryDocumentSnapshot,
): FirebaseFirestore.Query {
  let query = db.collection('statuses').orderBy('createdAt').limit(500);

  if (lastDocument) {
    query = query.startAfter(lastDocument.data().createdAt);
  }

  return query;
}

dump();
