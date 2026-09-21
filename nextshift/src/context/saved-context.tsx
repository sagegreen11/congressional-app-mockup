import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type SavedContextValue = {
  savedJobIds: string[];
  toggleJob: (id: string) => void;
  isSaved: (id: string) => boolean;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['j1']);

  const value = useMemo(
    () => ({
      savedJobIds,
      toggleJob: (id: string) => {
        setSavedJobIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
      },
      isSaved: (id: string) => savedJobIds.includes(id),
    }),
    [savedJobIds],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error('useSaved must be used inside SavedProvider');
  }
  return ctx;
}
