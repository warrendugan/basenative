const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ChallengeEntry {
  challenge: string;
  expiresAt: number;
}

const store = new Map<string, ChallengeEntry>();

export const challengeStore = {
  set(key: string, challenge: string): void {
    store.set(key, {
      challenge,
      expiresAt: Date.now() + TTL_MS,
    });
  },

  get(key: string): string | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.challenge;
  },

  delete(key: string): void {
    store.delete(key);
  },
};

// Periodic cleanup every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, 60_000).unref();
