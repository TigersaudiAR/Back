export function formatTimeRange(value: string) {
  return value
    .split("-")
    .map((part) => part.trim())
    .join(" - ");
}

export function secondsToClock(seconds: number) {
  const date = new Date(seconds * 1000);
  return date.toISOString().substring(14, 19);
}

export function nowInHours() {
  return new Date().getHours();
}
