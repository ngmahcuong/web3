import { ComptrollerUserInfo, IComptroller } from './interfaces/IComptroller';
import ComptrollerAbi from '../../../abis/Comptroller.json';
import { getComptrollerAddress, getLendingRewardEstimator } from '../../../config';
import { QueuedMulticall } from '@reddotlabs/multicall-react';
import { Interface } from 'ethers/lib/utils';
import { ComptrollerInterface } from '../../../typechain/Comptroller';

const comptrollerInterface = new Interface(ComptrollerAbi) as ComptrollerInterface;

export class Comptroller implements IComptroller {
  address: string;
  private rewardEstimator: string;

  constructor(chainId: number, private multicall: QueuedMulticall) {
    this.address = getComptrollerAddress(chainId);
    this.rewardEstimator = getLendingRewardEstimator(chainId);
  }

  async userInfo(account: string): Promise<ComptrollerUserInfo> {
    const [[assetsIn], [, liquidity, shortfall]] = await this.multicall.enqueue([
      {
        target: this.address,
        abi: comptrollerInterface.functions['getAssetsIn(address)'],
        params: [account],
      },
      {
        target: this.address,
        abi: comptrollerInterface.functions['getAccountLiquidity(address)'],
        params: [account],
      },
    ]);

    return {
      assetsIn,
      accountLiquidity: {
        liquidity,
        shortfall,
      },
    };
  }
}
