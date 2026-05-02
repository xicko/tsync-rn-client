import { domain as INITIAL_DOMAIN } from '@/constants/domain';
import { storage } from '@/utils/storage';
import { create } from 'zustand';
import { Platform } from 'react-native';
import tsyncnativeModule from '@/modules/tsyncnative';

const DOMAIN_KEY = 'domain';

export interface BearState {
  domainAddress: string;
  setDomainAddress: (val: string) => void;
}

export const useZust = create<BearState>((set) => ({
  domainAddress: (() => {
    const cache = Platform.OS === 'web'
      ?  typeof window !== 'undefined'
        ? localStorage.getItem(DOMAIN_KEY)
        : INITIAL_DOMAIN
      : storage.getString(DOMAIN_KEY);
    if (cache) return cache;
    storage.set(DOMAIN_KEY, INITIAL_DOMAIN);
    return INITIAL_DOMAIN;
  })(),
  setDomainAddress: (val) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem(DOMAIN_KEY, val);
    } else if (Platform.OS !== 'web') {
      storage.set(DOMAIN_KEY, val);
    }
    set({ domainAddress: val });
  },
}));
