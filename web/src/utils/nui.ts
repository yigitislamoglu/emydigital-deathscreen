export function getResourceName(): string {
  const w = window as Window & { GetParentResourceName?: () => string };
  return w.GetParentResourceName?.() ?? "emydigital-deathscreen";
}

export function isEnvBrowser(): boolean {
  return !(window as Window & { invokeNative?: unknown }).invokeNative;
}

/** Posts to a Lua NUI callback. Returns a mock in browser preview. */
export async function fetchNui<T = unknown>(
  event: string,
  data?: unknown,
): Promise<T> {
  if (isEnvBrowser()) {
    return { ok: true } as T;
  }

  const response = await fetch(`https://${getResourceName()}/${event}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data ?? {}),
  });

  return response.json() as Promise<T>;
}
