import * as admin from 'firebase-admin';
import * as fs from 'fs';

admin.initializeApp();

const db = admin.firestore();
const stream = fs.createWriteStream('data/statuses.json', { flags: 'a' });

async function dump() {
  let next = true;
  let query = page();
  let dumped = 0;
  stream.write('[\n');

  while (next) {
    const snapshot = await query.get();
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];
    snapshot.docs.forEach((doc) => {
      stream.write((dumped ? ',\n' : '') + doc.data().data);
      dumped++;
    });

    console.log(`Dumped ${snapshot.docs.length} of ${dumped} documents`);

    if (snapshot.docs.length === 0) {
      next = false;
    } else {
      query = page(lastDocument);
    }
  }

  stream.write(']\n');
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
