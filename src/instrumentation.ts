export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmNotionCache } = await import("@/lib/warmCache");
    await warmNotionCache();
  }
}
