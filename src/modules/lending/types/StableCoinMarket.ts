import { Call, CallResult } from '@reddotlabs/multicall';
import { getStableCoinAddress } from '../../../config';
import { Erc20Market } from './Erc20Market';

export class StableMarket extends Erc20Market {
  protected getInfoCall(): Call[] {
    const calls = super.getInfoCall();
    const stableCoinAddress = getStableCoinAddress(this.chainId);
    return [
      ...calls,
      {
        target: stableCoinAddress,
        signature: 'maxCap() returns (uint256)',
        params: [],
      },
      {
        target: stableCoinAddress,
        signature: 'totalSupply() returns (uint256)',
        params: [],
      },
    ];
  }

  protected parseResponse(result: CallResult[]) {
    const [[maxCap], [totalSupply]] = result.slice(result.length - 2);
    return {
      ...super.parseResponse(result),
      totalSupply: maxCap,
      cash: maxCap.sub(totalSupply),
    };
  }
}
