import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAFPfMM23W6SW8dsHv5sxw4e9pDg874kFw",
  authDomain: "dailyflow-wrifa.firebaseapp.com",
  projectId: "dailyflow-wrifa",
  storageBucket: "dailyflow-wrifa.firebasestorage.app",
  messagingSenderId: "393238953369",
  appId: "1:393238953369:web:6f91ab374a476160bea708",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const KNOWN_GOOD_PHOTO_IDS = [
  "photo-1507525428034-b723cf961d3e",
  "photo-1519046904884-53103b34b206",
  "photo-1583417319070-4a69db38a482",
  "photo-1512343879784-a960bf40e7f2",
  "photo-1501785888041-af3ef285b470",
  "photo-1559592413-7cec4d0cae2b",
  "photo-1528127269322-539801943592",
  "photo-1464822759023-fed622ff2c3b",
  "photo-1506744038136-46273834b3fb",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1432405972618-c60b0225b8f9",
  "photo-1518457607834-6e8d80c183c5",
  "photo-1447752875215-b2761acb3c5d",
  "photo-1555396273-367ea4eb4db5",
  "photo-1504674900247-0877df9cc836",
  "photo-1565299624946-b28f40a0ae38",
  "photo-1540420773420-3366772f4999",
  "photo-1567620905732-2d1ec7ab7445",
  "photo-1436491865332-7a61a109cc05",
  "photo-1549399542-7e3f8b79c341",
  "photo-1517524008697-84bbe3c3fd98",
  "photo-1449965408869-eaa3f722e40d",
  "photo-1485291571150-772bcfc10da5",
];

const VERIFIED_BEACH_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
];

const VERIFIED_CAVE_IMAGES = [
  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
];

const VERIFIED_STREAM_IMAGES = [
  "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
];

const VERIFIED_FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80",
];

const VERIFIED_TAXI_IMAGES = [
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1200&q=80",
];

const VERIFIED_HERITAGE_IMAGES = [
  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
];

function isReliableImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true;
  if (url.includes("wikimedia.org")) return true;
  return KNOWN_GOOD_PHOTO_IDS.some((id) => url.includes(id));
}

function getVerifiedImageForTopic(destination = "", contextText = "", index = 0) {
  const combined = `${destination} ${contextText}`.toLowerCase();
  if (/ẩm thực|đặc sản|món ăn|bánh lọc|cháo canh|hải sản|bánh bèo|mệ xuân|ăn uống/i.test(combined)) {
    return VERIFIED_FOOD_IMAGES[index % VERIFIED_FOOD_IMAGES.length];
  }
  if (/taxi|sân bay|ga |đưa đón|tài xế|xe đời mới|chuyến bay|lộ trình|giá cước|bác tài/i.test(combined)) {
    return VERIFIED_TAXI_IMAGES[index % VERIFIED_TAXI_IMAGES.length];
  }
  if (/hang|động|phong nha|thiên đường|sơn đoòng|thạch nhũ|núi đá|tiên sơn|hang tối/i.test(combined)) {
    return VERIFIED_CAVE_IMAGES[index % VERIFIED_CAVE_IMAGES.length];
  }
  if (/suối|sông|thác|moọc|sông chày|hava|ozo|chèo kayak|tắm suối/i.test(combined)) {
    return VERIFIED_STREAM_IMAGES[index % VERIFIED_STREAM_IMAGES.length];
  }
  if (/biển|nhật lệ|bảo ninh|đá nhảy|cửa việt|cát trắng|bình minh|hoàng hôn|bãi tắm/i.test(combined)) {
    return VERIFIED_BEACH_IMAGES[index % VERIFIED_BEACH_IMAGES.length];
  }
  if (/vũng chùa|đảo yến|đại tướng|võ nguyên giáp|thành cổ|la vang|vịnh mốc|hiền lương|tâm linh/i.test(combined)) {
    return VERIFIED_HERITAGE_IMAGES[index % VERIFIED_HERITAGE_IMAGES.length];
  }
  const genericPool = [...VERIFIED_BEACH_IMAGES, ...VERIFIED_CAVE_IMAGES, ...VERIFIED_STREAM_IMAGES];
  return genericPool[index % genericPool.length];
}

async function run() {
  console.log("Fetching travel_guides from Firestore...");
  const snap = await getDocs(collection(db, "travel_guides"));
  console.log(`Found ${snap.size} documents.`);

  let repairedCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    let modified = false;

    // 1. Cover Image
    if (!isReliableImageUrl(data.coverImage)) {
      const oldUrl = data.coverImage;
      data.coverImage = getVerifiedImageForTopic(data.destination || "", data.title || "", 0);
      console.log(`[${data.slug}] Replaced cover image: ${oldUrl} -> ${data.coverImage}`);
      modified = true;
    }

    // 2. Sections
    if (Array.isArray(data.sections)) {
      data.sections.forEach((sec, idx) => {
        if (!isReliableImageUrl(sec.image)) {
          const oldUrl = sec.image;
          sec.image = getVerifiedImageForTopic(data.destination || "", sec.heading || "", idx);
          console.log(`[${data.slug}] Section ${idx} replaced: ${oldUrl} -> ${sec.image}`);
          modified = true;
        }
      });
    }

    // 3. Gallery
    if (Array.isArray(data.gallery)) {
      data.gallery.forEach((g, idx) => {
        if (!isReliableImageUrl(g.url)) {
          const oldUrl = g.url;
          g.url = getVerifiedImageForTopic(data.destination || "", g.caption || "", idx);
          console.log(`[${data.slug}] Gallery ${idx} replaced: ${oldUrl} -> ${g.url}`);
          modified = true;
        }
      });
    }

    if (modified) {
      await setDoc(doc(db, "travel_guides", docSnap.id), data, { merge: true });
      repairedCount++;
      console.log(`===> Successfully updated ${docSnap.id} in Firestore.`);
    }
  }

  console.log(`Done! Repaired ${repairedCount} documents in Firestore.`);
  process.exit(0);
}

run().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
