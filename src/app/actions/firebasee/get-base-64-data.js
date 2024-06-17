import { db } from "@/src/firebase";
import { getDoc, doc } from "firebase/firestore";

const getBase64Data = async (docId) => {
  try {
    const docSnap = await getDoc(doc(db, "base64", docId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.base64;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document:", e);
    return null;
  }
};

export { getBase64Data };
