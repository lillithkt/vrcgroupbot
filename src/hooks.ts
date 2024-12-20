const shutdownHooks = new Set<() => Promise<void>>();
export function addShutdownHook(hook: () => Promise<void>) {
  shutdownHooks.add(hook);
}
export async function shutdown() {
  for (const hook of shutdownHooks) {
    await hook();
  }
  process.exit(0);
}
process.on("SIGTERM", shutdown);