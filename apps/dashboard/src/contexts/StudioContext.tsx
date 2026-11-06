import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StudioDto } from '../types';

const STORAGE_KEY = 'df_selected_studio';

interface StudioContextValue {
  selectedStudio: StudioDto | null;
  setSelectedStudio: (studio: StudioDto | null) => void;
  clearSelectedStudio: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [selectedStudio, setSelectedStudioState] = useState<StudioDto | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as StudioDto) : null;
    } catch {
      return null;
    }
  });

  const setSelectedStudio = useCallback((studio: StudioDto | null) => {
    setSelectedStudioState(studio);
    if (studio) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studio));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Natychmiast wejdź we framework Query i wyczyść wszystko od innej firmy/salonu
    queryClient.resetQueries();
  }, [queryClient]);

  const clearSelectedStudio = useCallback(() => {
    setSelectedStudioState(null);
    localStorage.removeItem(STORAGE_KEY);
    queryClient.resetQueries();
  }, [queryClient]);

  return (
    <StudioContext.Provider value={{ selectedStudio, setSelectedStudio, clearSelectedStudio }}>
      {children}
    </StudioContext.Provider>
  );
};

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}

/** Odczytuje studioId z localStorage bez hooków — do użycia w apiClient.ts */
export function getSelectedStudioId(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const studio = JSON.parse(saved) as StudioDto & { id?: string };
    return studio.studioId || studio.id || null;
  } catch {
    return null;
  }
}
