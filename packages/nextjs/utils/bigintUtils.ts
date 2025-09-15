// packages/nextjs/utils/bigintUtils.ts
// Utility functions to handle BigInt safely in React components

/**
 * Safely stringify any object that might contain BigInt values
 */
export const safeStringify = (obj: any, space?: number): string => {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n';
      }
      return value;
    }, space);
  } catch (error) {
    return `Serialization error: ${error}`;
  }
};

/**
 * Convert any value to a safe number for display
 */
export const toSafeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  
  let numValue = value;
  
  // Handle array responses
  if (Array.isArray(value)) {
    numValue = value[0];
  }
  
  // Handle BigInt
  if (typeof numValue === 'bigint') {
    numValue = Number(numValue);
  }
  
  // Handle objects with single property
  if (typeof numValue === 'object' && numValue !== null) {
    const keys = Object.keys(numValue);
    if (keys.length === 1) {
      numValue = numValue[keys[0]];
      if (typeof numValue === 'bigint') {
        numValue = Number(numValue);
      }
    }
  }
  
  const parsed = Number(numValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Convert any value to a safe string for display
 */
export const toSafeString = (value: any): string => {
  if (value === undefined || value === null) return "";
  
  let stringValue = value;
  
  // Handle array responses
  if (Array.isArray(value)) {
    stringValue = value[0];
  }
  
  // Handle BigInt
  if (typeof stringValue === 'bigint') {
    return stringValue.toString();
  }
  
  // Handle objects with single property
  if (typeof stringValue === 'object' && stringValue !== null) {
    const keys = Object.keys(stringValue);
    if (keys.length === 1) {
      stringValue = stringValue[keys[0]];
      if (typeof stringValue === 'bigint') {
        return stringValue.toString();
      }
    }
  }
  
  return String(stringValue);
};

/**
 * Safely convert value to BigInt
 */
export const toBigInt = (value: any): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string' || typeof value === 'number') {
    return BigInt(value);
  }
  if (Array.isArray(value) && value.length > 0) {
    return toBigInt(value[0]);
  }
  return BigInt(0);
};

/**
 * Check if a value represents zero
 */
export const isZero = (value: any): boolean => {
  return toSafeNumber(value) === 0;
};

/**
 * Format address for display (shortened with ellipsis)
 */
export const formatAddress = (address: any): string => {
  const addr = toSafeString(address);
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};