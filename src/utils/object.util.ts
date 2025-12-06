// src/utils/object.util.ts

// Remove fields from an object (non-mutating).
export const removeFields = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const clone: any = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};

// Cast BigInt fields to number or string.
// Useful when Prisma returns BigInt (e.g., id, totals).
export const castBigIntDeep = (value: any): any => {
  if (typeof value === 'bigint') {
    // decide your strategy: number or string
    return Number(value); // or value.toString()
  }
  if (Array.isArray(value)) {
    return value.map(castBigIntDeep);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = castBigIntDeep(v);
    }
    return result;
  }
  return value;
};
