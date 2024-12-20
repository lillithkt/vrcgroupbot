const shutdownHooks = new Set<() => Promise<void>>();
export function addShutdownHook(hook: () => Promise<void>) {
  shutdownHooks.add(hook);
}
export async function shutdown(restart: boolean = false) {
  for (const hook of shutdownHooks) {
    await hook();
  }
  process.exit(restart ? 42 : 0);
}
process.on("SIGTERM", () => shutdown());