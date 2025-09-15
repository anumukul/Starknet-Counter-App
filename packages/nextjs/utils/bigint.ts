// utils/bigint.ts
export const safeStringify = (obj: any): string => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  );
};

export const formatContractValue = (value: any): string => {
  if (value === undefined || value === null) return "?";
  
  // Handle array responses
  if (Array.isArray(value)) {
    value = value[0];
  }
  
  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  // Handle objects that might contain BigInt
  if (typeof value === 'object' && value !== null) {
    // If it's an object with a single property, try to extract the value
    const keys = Object.keys(value);
    if (keys.length === 1) {
      return formatContractValue(value[keys[0]]);
    }
  }
  
  return String(value);
};

export const parseContractInt = (value: any): number | undefined => {
  try {
    const formatted = formatContractValue(value);
    const num = Number(formatted);
    return Number.isFinite(num) ? num : undefined;
  } catch {
    return undefined;
  }
};