"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot, getServerSnapshot, type Store, type PersonRec } from "./db";

export function useStore(): Store {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSession(): { store: Store; person: PersonRec | null } {
  const store = useStore();
  const person = store.session ? store.people.find((p) => p.id === store.session!.userId) ?? null : null;
  return { store, person };
}
