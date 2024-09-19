import { BigNumber } from '@ethersproject/bignumber';

export type ComptrollerInfo = {
  closeFactor: BigNumber;
};

export type ComptrollerUserInfo = {
  assetsIn: string[];
  accountLiquidity: {
    liquidity: BigNumber;
    shortfall: BigNumber;
  };
};

export interface IComptroller {
  address: string;
  userInfo(account: string): Promise<ComptrollerUserInfo>;
}
