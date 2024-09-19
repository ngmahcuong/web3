import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
import { isAddress } from '../../../utils/addresses';

export function validatedRecipient(recipient: string): string | undefined {
  const ENS_NAME_REGEX =
    /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
  const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

  if (typeof recipient !== 'string') return undefined;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return undefined;
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
export function involvesAddress(
  trade:
    | Trade<Currency, Currency, TradeType.EXACT_INPUT>
    | Trade<Currency, Currency, TradeType.EXACT_OUTPUT>,
  checksummedAddress: string,
): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  );
}
