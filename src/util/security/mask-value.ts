export function maskValue(value: string): string {
  const len = value.length;
  const maskCount = Math.floor(len * 0.8);
  return '*'.repeat(maskCount) + value.slice(maskCount);
}
