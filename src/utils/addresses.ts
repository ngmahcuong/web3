import { getAddress } from 'ethers/lib/utils';

export const shortenAddress = (address: string, startLength?: number, endLength?: number) => {
  if (address && address.length > 0) {
    return `${address.substring(0, startLength || 6)}...${address.substring(
      address.length - (endLength || 4),
      address.length,
    )}`;
  }
};

/**
 *
 * @param value
 * @returns the checksummed address if the address is valid, otherwise returns false
 */
export function isAddress(value: string): string | false {
  try {
    return getAddress(value.toLowerCase());
  } catch {
    return false;
  }
}
