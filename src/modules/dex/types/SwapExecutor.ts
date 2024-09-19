import SwapExecutorAbi from '../../../abis/SwapExecutor.json';
import { defaultAbiCoder, Interface } from 'ethers/lib/utils';
import { SwapExecutorInterface } from '../../../typechain/SwapExecutor';
import { BigNumber, BigNumberish, constants, Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ETH_ADDRESS } from '../../../utils/constants';

const swapExecutorAbiInterface = new Interface(SwapExecutorAbi) as SwapExecutorInterface;

export enum AdapterType {
  depositETH, // 0
  withdrawETH,
  uniswapV2,
  chaiStableSwap,
}

export type SwapStep =
  | {
      adapter: AdapterType.depositETH;
      weth: string;
    }
  | {
      adapter: AdapterType.withdrawETH;
      weth: string;
    }
  | {
      adapter: AdapterType.uniswapV2;
      pair: string;
      fromToken: string;
      toToken: string;
      fee: BigNumberish;
      feeDenom: BigNumberish;
    }
  | {
      adapter: AdapterType.chaiStableSwap;
      market: string;
      fromToken: string;
      toToken: string;
      fromIndex: number;
      toIndex: number;
    };

export type CallDescription = {
  adapter: BigNumberish;
  market: string;
  fromToken: string;
  toToken: string;
  data: string;
};

export const transformDescription = (desc: SwapStep): CallDescription => {
  switch (desc.adapter) {
    case AdapterType.depositETH:
      return {
        adapter: +desc.adapter,
        fromToken: ETH_ADDRESS,
        toToken: desc.weth,
        market: constants.AddressZero,
        data: '0x',
      };
    case AdapterType.withdrawETH:
      return {
        adapter: +desc.adapter,
        toToken: desc.weth,
        fromToken: constants.AddressZero,
        market: constants.AddressZero,
        data: '0x',
      };
    case AdapterType.uniswapV2:
      return {
        adapter: +desc.adapter,
        market: desc.pair,
        fromToken: desc.fromToken,
        toToken: desc.toToken,
        data: defaultAbiCoder.encode(['uint256', 'uint256'], [desc.fee, desc.feeDenom]),
      };
    case AdapterType.chaiStableSwap:
      return {
        adapter: +desc.adapter,
        market: desc.market,
        fromToken: desc.fromToken,
        toToken: desc.toToken,
        data: defaultAbiCoder.encode(['uint8', 'uint8'], [desc.fromIndex, desc.toIndex]),
      };
    default:
      throw new Error('Invalid call description');
  }
};

export const serializeCallDescription = (calls: CallDescription[]) => {
  return defaultAbiCoder.encode(
    ['tuple(uint256,address,address,address,bytes)[]'],
    [calls.map((t) => [t.adapter, t.market, t.fromToken, t.toToken, t.data])],
  );
};

export class SwapExecutor extends Contract {
  constructor(address: string, provider: Signer | Provider) {
    super(address, swapExecutorAbiInterface, provider);
  }

  async estimateAmountsOut(amountIn: BigNumberish, steps: SwapStep[]) {
    const transformedDescriptions = steps.map(transformDescription);
    const [data] = await this.functions.estimateAmountsOut(
      amountIn,
      serializeCallDescription(transformedDescriptions),
    );
    return data as BigNumber[];
  }
}
