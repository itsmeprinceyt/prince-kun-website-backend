import { env } from "../config/env.js";
import type { DiscordUser } from "../types/user.js";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;

interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

const usernameCache = new Map<string, CacheEntry>();

function readCache(userId: string): string | null | undefined {
  const entry = usernameCache.get(userId);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    usernameCache.delete(userId);
    return undefined;
  }
  return entry.value;
}

function writeCache(userId: string, value: string | null): void {
  usernameCache.set(userId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Resolves a Discord user's display name.
 * Returns `null` when the user cannot be resolved (deleted account, API error, timeout).
 */
export async function fetchDiscordUsername(
  userId: string,
): Promise<string | null> {
  const cached = readCache(userId);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/${userId}`, {
      headers: { Authorization: `Bot ${env.discordBotToken}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        `[ DISCORD ] Failed to fetch user ${userId}: ${response.status} ${response.statusText}`,
      );

      // 404 = deleted/unknown user: cache the negative result, it won't change soon.
      if (response.status === 404) writeCache(userId, null);

      return null;
    }

    const data = (await response.json()) as DiscordUser;
    const name = data.global_name ?? data.username ?? null;
    writeCache(userId, name);
    return name;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[ DISCORD ] Error fetching user ${userId}: ${reason}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function clearDiscordCache(): void {
  usernameCache.clear();
}
