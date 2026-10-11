import React, { createContext, useContext, useState } from 'react';

type Language = 'english' | 'tamil';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  showFullLyrics: boolean;
  setShowFullLyrics: (val: boolean) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'english',
  setLanguage: () => {},
  showFullLyrics: false,
  setShowFullLyrics: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('english');
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, showFullLyrics, setShowFullLyrics }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
