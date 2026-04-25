'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, query, where, getDocs, orderBy, limit } from '@/frontend/lib/firebase-client';
import { User } from 'firebase/auth';
import { MasteryRecord } from '@/shared/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [recentTopics, setRecentTopics] = useState<MasteryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch recent topics
        try {
          const q = query(
            collection(db, 'mastery'),
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(3)
          );
          const querySnapshot = await getDocs(q);
          const topics = querySnapshot.docs.map(doc => doc.data() as MasteryRecord);
          setRecentTopics(topics);
        } catch (error) {
          console.error("Error fetching recent topics:", error);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <h1 className="text-4xl font-bold mb-2 tracking-tight">VidyaAI</h1>
        <p className="text-gray-400 mb-8 text-lg">Learn anything. At your pace.</p>

        {isLoading ? (
          <div className="animate-pulse w-full h-12 bg-white/10 rounded-lg"></div>
        ) : user ? (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <img src={user.photoURL || ''} alt="Profile" className="w-16 h-16 rounded-full mb-3 border-2 border-[#00ff88]" />
              <p className="text-lg">Welcome back, {user.displayName?.split(' ')[0]}!</p>
            </div>

            {recentTopics.length > 0 && (
              <div className="w-full bg-black/20 rounded-xl p-4 text-left border border-white/5">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Recent Topics</h3>
                <ul className="space-y-2">
                  {recentTopics.map((record, i) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span>{record.topicName}</span>
                      <span className="text-[#00ff88] text-xs px-2 py-1 bg-[#00ff88]/10 rounded-full">{record.levelReached}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => router.push('/learn')}
              className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Start Learning
            </button>
            <button
              onClick={() => router.push('/mastery')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Mastery Dashboard
            </button>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-300 mt-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        )}
      </motion.div>
    </main>
  );
}
