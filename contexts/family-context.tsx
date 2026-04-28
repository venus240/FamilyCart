import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import type { Family, FamilyMember } from '@/types/database';
import * as familyApi from '@/lib/families';

type FamilyContextType = {
  family: Family | null;
  members: FamilyMember[];
  isLoading: boolean;
  createFamily: (name: string) => Promise<{ error: string | null }>;
  joinFamily: (code: string) => Promise<{ error: string | null }>;
  refreshFamily: () => Promise<void>;
};

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFamily = useCallback(async () => {
    if (!user) {
      setFamily(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await familyApi.getCurrentFamily();

      // Only update state if query succeeded — don't override on RLS errors
      if (!error) {
        setFamily(data);
        if (data) {
          const { data: memberData } = await familyApi.getFamilyMembers(data.id);
          setMembers(memberData);
        } else {
          setMembers([]);
        }
      }
    } catch {
      // silently fail — keep current state
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (session) {
      loadFamily();
    } else {
      setFamily(null);
      setMembers([]);
      setIsLoading(false);
    }
  }, [session, loadFamily]);

  const handleCreateFamily = useCallback(
    async (name: string) => {
      const { data, error } = await familyApi.createFamily(name);
      if (!error && data) {
        // Set family directly from RPC response (avoid RLS re-query issues)
        setFamily(data);
        // Try loading members (best-effort)
        try {
          const { data: memberData } = await familyApi.getFamilyMembers(data.id);
          setMembers(memberData);
        } catch {}
      }
      return { error };
    },
    []
  );

  const handleJoinFamily = useCallback(
    async (code: string) => {
      const { data, error } = await familyApi.joinFamily(code);
      if (!error && data) {
        setFamily(data);
        try {
          const { data: memberData } = await familyApi.getFamilyMembers(data.id);
          setMembers(memberData);
        } catch {}
      }
      return { error };
    },
    []
  );

  return (
    <FamilyContext.Provider
      value={{
        family,
        members,
        isLoading,
        createFamily: handleCreateFamily,
        joinFamily: handleJoinFamily,
        refreshFamily: loadFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
