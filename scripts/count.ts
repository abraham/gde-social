import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

async function count() {
  let next = true;
  let query = page();
  let counted = 0;

  while (next) {
    const snapshot = await query.get();
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];
    counted = counted + snapshot.docs.length;
    console.log(`Counted ${snapshot.docs.length} of ${counted} documents`);

    if (snapshot.docs.length === 0) {
      next = false;
    } else {
      query = page(lastDocument)
    }
  }

  console.log(`Counted ${counted}`);
}

function page(lastDocument?: FirebaseFirestore.QueryDocumentSnapshot): FirebaseFirestore.Query {
  let query =  db.collection('statuses')
    .orderBy('createdAt')
    .limit(500);

  if (lastDocument) {
    query = query.startAfter(lastDocument.data().createdAt);
  }

  return query;
}

count();
