import GeneralList from '@/components/general-list';
import { getAcharyasList } from '@/database/acharyas';
import React from 'react';

export default function AcharyasScreen() {
  return (
    <GeneralList
      title="Acharyas"
      category="acharyas"
      fetchList={getAcharyasList}
    />
  );
}
