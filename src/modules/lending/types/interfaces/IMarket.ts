import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { Market, UserPositionInMarket } from '../../models/Lending';

export interface IMarket {
  address: string;
  info(): Promise<Market>;
  userInfo(account: string): Promise<UserPositionInMarket>;

  interestRateModel(): Promise<string>;
  supply(amount: BigNumber): Promise<TransactionResponse>;
  repay(amount: BigNumber, isMaxAmount: boolean, account: string): Promise<TransactionResponse>;
  borrow(amount: BigNumber): Promise<TransactionResponse>;
  redeemUnderlying(amount: BigNumber): Promise<TransactionResponse>;
  redeem(amount: BigNumber): Promise<TransactionResponse>;
  redeemAll(): Promise<TransactionResponse>;
  liquidateBorrow(
    borrower: string,
    repayAmount: BigNumber,
    ibTokenCollateral: string,
  ): Promise<TransactionResponse>;
}
