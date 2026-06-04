export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      // plain text error body
    }
    return error.message;
  }
  return fallback;
}
