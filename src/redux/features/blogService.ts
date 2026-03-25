import {
  collection, addDoc, getDocs, doc, getDoc,
  updateDoc, deleteDoc, query, orderBy, where, Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase-config';
import type { Blog } from './Blogslice';

const COLLECTION = 'blogs';

export const saveBlogToFirebase = async (data: {
  title: string;
  content: string;
}): Promise<Blog> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');


  let authorName = user.email ?? 'Anonymous';
  try {
    const userSnap = await getDoc(doc(db, 'users', user.email!));
    if (userSnap.exists()) {
      const { firstName, lastName } = userSnap.data();
      if (firstName || lastName) {
        authorName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
      }
    }
  } catch {
    
  }

  const now = Timestamp.now().toMillis();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: now,
    userId: user.uid,
    userEmail: user.email,
    authorName,           
  });

  return { id: docRef.id, ...data, createdAt: now, userId: user.uid, authorName };
};

export const fetchBlogsFromFirebase = async (): Promise<Blog[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Blog));
};


export const fetchAllBlogsFromFirebase = async (): Promise<Blog[]> => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Blog));
};

export const updateBlogInFirebase = async (
  id: string,
  data: { title: string; content: string }
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now().toMillis(),
  });
};

export const deleteBlogFromFirebase = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};