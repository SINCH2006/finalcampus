// src/utils/setAdminRole.ts
// Run this ONCE to convert a student account to admin

import { setUserRole } from '../firebase';

/**
 * HOW TO USE:
 * 
 * 1. Sign in to your app with the account you want to make admin
 * 2. Open browser console (F12)
 * 3. Run this in console:
 * 
 *    // Get current user ID
 *    const user = firebase.auth().currentUser;
 *    console.log("User ID:", user.uid);
 * 
 * 4. Then call this function with that UID
 */

export async function makeUserAdmin(userId: string) {
  try {
    console.log(`Setting user ${userId} as admin...`);
    await setUserRole(userId, 'admin');
    console.log('✅ User role updated to admin successfully!');
    console.log('You can now log in to the admin portal.');
    return true;
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
    return false;
  }
}

// For direct browser console usage
(window as any).makeUserAdmin = makeUserAdmin;