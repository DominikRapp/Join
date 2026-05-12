const FIREBASE_BASE_URL =
    "https://mein-join-d19ba-default-rtdb.europe-west1.firebasedatabase.app";

function buildFirebaseUrl(path = "") {
    const cleanPath = String(path).replace(/^\/+|\/+$/g, "");

    if (!cleanPath) {
        return `${FIREBASE_BASE_URL}/.json`;
    }

    return `${FIREBASE_BASE_URL}/${cleanPath}.json`;
}

window.FIREBASE_BASE_URL = FIREBASE_BASE_URL;
window.buildFirebaseUrl = buildFirebaseUrl;