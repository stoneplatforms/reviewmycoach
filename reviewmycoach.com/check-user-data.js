const admin = require('firebase-admin');
const serviceAccount = require('./Review My Coach Firebase Service Account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
  const userId = 'LY45awMdvLVTSxAwRxwlG1PnpiG2';
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (userDoc.exists) {
    console.log('User data:', JSON.stringify(userDoc.data(), null, 2));
  } else {
    console.log('User not found');
  }
  
  process.exit(0);
}

checkUser().catch(console.error);
