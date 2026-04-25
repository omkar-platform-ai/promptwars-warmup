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
        } catch {
          // Firestore may not be available yet — silently continue
          setRecentTopics([]);
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

  const cardStyle = {
    maxWidth: '400px',
    width: '100%',
    padding: '40px 32px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    margin: '0 auto'
  };

  if (isLoading) {
    return (
      <main style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,136,0.07) 0%, #0a0a0a 60%)',
      }}>
        <div className="w-8 h-8 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,136,0.07) 0%, #0a0a0a 60%)',
      }}>
        <div style={cardStyle}>
          <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700, margin: 0 }}>VidyaAI</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 24px' }}>
            Learn anything. At your pace.
          </p>
          <button
            onClick={handleSignIn}
            aria-label="Sign in with Google"
            style={{
              width: '100%', padding: '14px',
              background: '#00ff88', color: '#000000',
              border: 'none', borderRadius: '10px',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '10px',
            }}
          >
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="G" />
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,136,0.07) 0%, #0a0a0a 60%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-auto px-8 py-10 rounded-2xl flex flex-col items-center text-center"
        style={{
          background: 'linear-gradient(135deg, #0d1f17 0%, #0a0a0a 100%)',
          border: '1px solid rgba(0,255,136,0.2)',
          boxShadow: '0 0 60px rgba(0,255,136,0.08), 0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{
          background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>VidyaAI</h1>
        <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>Learn anything. At your pace.</p>

        <div className="w-full flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                style={{
                  width: '64px', height: '64px', 
                  borderRadius: '50%',
                  border: '2px solid #00ff88',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(0,255,136,0.15)',
                border: '2px solid #00ff88',
                display: 'flex', alignItems: 'center', 
                justifyContent: 'center',
                color: '#00ff88', fontSize: '1.5rem', fontWeight: 700,
              }}>
                {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <p className="text-lg" style={{ color: '#ffffff', fontWeight: 600 }}>Welcome back, {user?.displayName?.split(' ')[0]}!</p>
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
            aria-label="Start learning about this topic"
            className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            style={{ background: '#00ff88', color: '#000000' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Start Learning
          </button>
          <button
            onClick={() => router.push('/mastery')}
            className="w-full bg-white/10 hover:bg-white/20 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            style={{
              border: '1px solid rgba(0,255,136,0.2)',
              color: 'rgba(0,255,136,0.8)'
            }}
          >
            Mastery Dashboard
          </button>

          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-sm hover:text-white mt-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </main>
  );
}
