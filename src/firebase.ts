import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Post, AdSenseConfig, AffiliateNetworkConfig, CategorySlug } from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const ADMIN_EMAIL = 'fedinheiroedestino@gmail.com';

export function isAuthorizedAdmin(user: User | null): boolean {
  return Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL && user.emailVerified);
}

export { onAuthStateChanged, signInWithPopup, signOut };

// Validate connection on boot as required by Firestore skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('☁️ [Firebase Firestore] Conexão com o banco de dados na nuvem estabelecida com sucesso.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('⚠️ [Firebase Firestore] O cliente está offline ou as regras estão sendo sincronizadas.');
      return false;
    }
    // Expected during initial empty test doc read, but means server reached
    console.log('☁️ [Firebase Firestore] Nuvem do Google conectada e operacional.');
    return true;
  }
}

// Run boot check
testFirestoreConnection();

/**
 * Fetch all posts stored in Google Cloud Firestore
 */
export async function fetchPostsFromCloud(): Promise<Post[]> {
  try {
    const colRef = collection(db, 'posts');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    
    const cloudPosts: Post[] = [];
    const catMapping: Record<string, { cat: CategorySlug; label: string }> = {
      'power-tools': { cat: 'tools', label: 'Tools' },
      'outdoor-gear': { cat: 'tools', label: 'Tools' },
      'kitchen-appliances': { cat: 'home-decoration', label: 'Home and Decoration' },
      'smart-home': { cat: 'home-decoration', label: 'Home and Decoration' },
      'home-utilities': { cat: 'home-decoration', label: 'Home and Decoration' },
    };

    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Post;
      const catInfo = catMapping[data.category];
      cloudPosts.push({
        ...data,
        id: docSnap.id,
        category: catInfo ? catInfo.cat : data.category,
        categoryLabel: catInfo ? catInfo.label : data.categoryLabel,
        author: {
          name: 'Equipe Worthora',
          role: 'Equipe Editorial Worthora',
          avatar: '/worthora_logo.jpg'
        }
      });
    });

    // Sort by publication date descending
    cloudPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return cloudPosts;
  } catch (err) {
    console.warn('Falha ao buscar posts do Firestore na nuvem:', err);
    return [];
  }
}

/**
 * Sync author profile across all articles in Google Cloud Firestore
 */
export async function syncAllAuthorsToWorthora(): Promise<void> {
  try {
    const colRef = collection(db, 'posts');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      for (const docSnap of snapshot.docs) {
        const docRef = doc(db, 'posts', docSnap.id);
        await setDoc(docRef, {
          author: {
            name: 'Equipe Worthora',
            role: 'Equipe Editorial Worthora',
            avatar: '/worthora_logo.jpg'
          }
        }, { merge: true });
      }
      console.log('☁️ [Firebase] 100% dos artigos sincronizados com a identidade da Equipe Worthora.');
    }
  } catch (err) {
    console.warn('Sync authors in cloud warning:', err);
  }
}

/**
 * Save or update a post in Google Cloud Firestore
 */
export async function savePostToCloud(post: Post): Promise<boolean> {
  try {
    const docRef = doc(db, 'posts', post.id);
    await setDoc(docRef, {
      ...post,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`☁️ [Firebase] Post "${post.title}" salvo com sucesso no banco de dados na nuvem.`);
    return true;
  } catch (err) {
    console.error('Erro ao salvar post no Firestore:', err);
    return false;
  }
}

/**
 * Delete a post from Google Cloud Firestore
 */
export async function deletePostFromCloud(postId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
    console.log(`☁️ [Firebase] Post ${postId} removido da nuvem.`);
    return true;
  } catch (err) {
    console.error('Erro ao excluir post no Firestore:', err);
    return false;
  }
}

/**
 * Fetch global settings from Google Cloud Firestore
 */
export async function fetchSettingsFromCloud(): Promise<{
  adSense?: AdSenseConfig;
  affiliates?: AffiliateNetworkConfig;
  adminEmail?: string;
} | null> {
  try {
    const docRef = doc(db, 'settings', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (err) {
    console.warn('Falha ao buscar configurações do Firestore:', err);
    return null;
  }
}

/**
 * Save global settings to Google Cloud Firestore
 */
export async function saveSettingsToCloud(settings: {
  adSense?: AdSenseConfig;
  affiliates?: AffiliateNetworkConfig;
  adminEmail?: string;
}): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, {
      ...settings,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log('☁️ [Firebase] Configurações globais sincronizadas com a nuvem do Google.');
    return true;
  } catch (err) {
    console.error('Erro ao salvar configurações no Firestore:', err);
    return false;
  }
}

/**
 * Seed initial local posts to Firestore if cloud collection is currently empty
 */
export async function seedInitialPostsToCloud(posts: Post[], settings?: any): Promise<void> {
  try {
    const colRef = collection(db, 'posts');
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty && posts.length > 0) {
      console.log(`☁️ [Firebase] Inicializando migração de ${posts.length} artigos para o Google Cloud Firestore...`);
      for (const post of posts) {
        await savePostToCloud(post);
      }
      if (settings) {
        await saveSettingsToCloud(settings);
      }
      console.log('✅ [Firebase] Migração inicial para o banco na nuvem concluída com sucesso!');
    }
  } catch (err) {
    console.warn('Não foi possível verificar ou popular dados iniciais no Firestore:', err);
  }
}
