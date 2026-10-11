import GeneralList from '@/components/general-list';
import { getDivyaDeshamsList } from '@/database/divya-desham';
import React from 'react';

export default function DivyaDeshamsScreen() {
  return (
    <GeneralList
      title="108 Divya Deshams"
      category="divya-deshams"
      fetchList={getDivyaDeshamsList}
    />
  );
}
