import React, { createContext, useCallback, useContext, useState } from 'react';

const TeamSelectionContext = createContext(null);

export function TeamSelectionProvider({ children }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const selectMember = useCallback((member) => {
    setSelectedMember(member);
  }, []);

  const clearMember = useCallback(() => {
    setSelectedMember(null);
  }, []);

  return (
    <TeamSelectionContext.Provider value={{ selectedMember, selectMember, clearMember }}>
      {children}
    </TeamSelectionContext.Provider>
  );
}

export function useTeamSelection() {
  const ctx = useContext(TeamSelectionContext);
  if (!ctx) {
    throw new Error('useTeamSelection must be used within TeamSelectionProvider');
  }
  return ctx;
}
