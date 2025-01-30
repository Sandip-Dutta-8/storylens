import { getCollections } from '@/actions/collection';
import { getJournalEntries } from '@/actions/story';
import React from 'react';
import Collections from './_components/collections';
import MoodAnalytics from './_components/mood-anlytics';
import Link from 'next/link';

const Dashboard = async () => {
  const collections = await getCollections();
  const entriesData = await getJournalEntries();

  // If unauthorized, show a sign-in link
  if (collections === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <h2 className="text-2xl font-semibold">You need to sign in to access the dashboard.</h2>
        <Link href="/sign-in" className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md">
          Go to Sign-in
        </Link>
      </div>
    );
  }

  // Group entries by collection
  const entriesByCollection = entriesData?.data?.entries?.reduce(
    (acc: any, entry: any) => {
      const collectionId = entry.collectionId || "unorganized";
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(entry);
      return acc;
    },
    {} as Record<string, typeof entriesData.data.entries>
  );

  return (
    <div className="px-4 py-8 space-y-8">
      <section className="space-y-4">
        <MoodAnalytics />
      </section>

      <Collections collections={collections} entriesByCollection={entriesByCollection} />
    </div>
  );
};

export default Dashboard;
