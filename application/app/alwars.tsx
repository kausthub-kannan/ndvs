import GeneralList from '@/components/general-list';
import { getAlwarsList } from '@/database/alwar';
import React from 'react';

export default function AlwarsScreen() {
  return (
    <GeneralList
      title="Alwars"
      category="alwars"
      fetchList={getAlwarsList}
    />
  );
}
