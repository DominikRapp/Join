import { getFirebaseData } from './js/data/API.js';

export let firebaseData = null;

/**
* Loads the Firebase root data once and caches it for reuse
* across the application lifecycle.
*
* @returns {Promise<Object|null>} The cached Firebase data object.
*/
export async function loadFirebaseData() {
  if (!firebaseData) {
    firebaseData = await getFirebaseData();
  }
  return firebaseData;
}
