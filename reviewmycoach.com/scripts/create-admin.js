// This is a utility script to create an admin user for testing
// Run this in your browser console or modify to work with your Firebase setup

const createAdminUser = async (userEmail) => {
  try {
    // This should be run with proper Firebase Admin SDK in a secure environment
    // For testing, you can manually update a user's role in Firebase console
    
    console.log(`To create an admin user, follow these steps:`);
    console.log(`1. Go to Firebase Console > Firestore Database`);
    console.log(`2. Find the 'users' collection`);
    console.log(`3. Find the document for user: ${userEmail}`);
    console.log(`4. Edit the document and change the 'role' field from 'student' or 'coach' to 'admin'`);
    console.log(`5. Save the changes`);
    console.log(`6. The user will now have admin access when they log in`);
    
    // Example document structure:
    const exampleDoc = {
      userId: "user-firebase-uid",
      email: userEmail,
      displayName: "Admin User",
      role: "admin", // Change this to 'admin'
      onboardingCompleted: true,
      isVerified: false,
      createdAt: new Date()
    };
    
    console.log(`Example document structure:`, exampleDoc);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage example:
// createAdminUser('admin@example.com');

module.exports = { createAdminUser }; 