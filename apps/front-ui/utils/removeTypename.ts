export function removeTypename<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeTypename) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const clone: any = {};
    for (const key in value) {
      if (key === '__typename') continue;
      clone[key] = removeTypename((value as any)[key]);
    }
    return clone;
  }
  return value;
}
