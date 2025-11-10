import { useState, useEffect } from 'react';
import { loadPreferences, savePreferences, type UserPreferences } from '../services/preferences';

/**
 * React hook for managing user preferences
 * Automatically loads preferences on mount and provides update function
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences()
      .then(setPreferences)
      .finally(() => setIsLoading(false));
  }, []);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (preferences) {
      const updated = { ...preferences, ...updates };
      setPreferences(updated);
      await savePreferences(updates);
    }
  };

  return { preferences, isLoading, updatePreferences };
}
