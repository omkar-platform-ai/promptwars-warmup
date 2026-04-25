'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, db, onAuthStateChanged, collection, query, where, onSnapshot, orderBy } from '@/frontend/lib/firebase-client';
import { User } from 'firebase/auth';
import { MasteryRecord } from '@/shared/types';

export default function MasteryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<MasteryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate mock streak
  const streak = records.length > 0 ? 3 : 0; 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, 'mastery'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedRecords = snapshot.docs.map(doc => doc.data() as MasteryRecord);
          // Deduplicate by topic name, keeping the highest mastery score
          const uniqueRecordsMap = new Map<string, MasteryRecord>();
          fetchedRecords.forEach(r => {
            const existing = uniqueRecordsMap.get(r.topicName);
            if (!existing || existing.masteryScore < r.masteryScore) {
              uniqueRecordsMap.set(r.topicName, r);
            }
          });
          setRecords(Array.from(uniqueRecordsMap.values()));
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching mastery records", error);
          setIsLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mt-12 flex flex-col gap-8"
      >
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Mastery Dashboard</h1>
            <p className="text-gray-400">Track your learning progress and stay consistent.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-[#00ff88]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{streak} Days</p>
              <p className="text-sm text-gray-400 uppercase tracking-wide">Current Streak</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !user ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-medium mb-4">Sign in to view your mastery dashboard</h2>
            <button
              onClick={() => router.push('/')}
              className="bg-[#00ff88] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#00cc6a] transition-colors"
            >
              Go to Home
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-medium mb-4">No topics studied yet.</h2>
            <p className="text-gray-400 mb-8">Your learning journey begins today.</p>
            <button
              onClick={() => router.push('/learn')}
              className="bg-[#00ff88] text-black px-8 py-4 rounded-xl font-semibold hover:bg-[#00cc6a] transition-colors"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((record, idx) => (
              <motion.div
                key={record.topicName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold capitalize">{record.topicName}</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                    Level {record.levelReached.replace('L', '')}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Mastery</span>
                    <span className="font-bold text-[#00ff88]">{record.masteryScore.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 border border-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.masteryScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-[#00ff88] h-full rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {user && records.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push('/learn')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-10 rounded-xl transition-colors duration-200 border border-white/20"
            >
              Continue Learning
            </button>
          </div>
        )}

      </motion.div>
    </main>
  );
}
