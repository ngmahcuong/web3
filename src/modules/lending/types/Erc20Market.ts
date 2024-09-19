import { TransactionResponse, JsonRpcSigner } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract, BigNumber } from 'ethers';
import { MErc20 as MarketContract } from '../../../typechain';
import { BaseMarket } from './BaseMarket';
import { IMarket } from './interfaces/IMarket';
import MErc20 from '../../../abis/MErc20.json';
import { QueuedMulticall } from '@reddotlabs/multicall-react';

export class Erc20Market extends BaseMarket implements IMarket {
  private contract: MarketContract;

  constructor(
    chainId: number,
    provider: JsonRpcSigner,
    address: string,
    multicall: QueuedMulticall,
  ) {
    super(chainId, provider, address, multicall);
    this.contract = new Contract(address, MErc20, provider) as MarketContract;
  }

  async redeemAll(): Promise<TransactionResponse> {
    return this.contract.redeem(await this.contract.balanceOf(await this.signer.getAddress()));
  }

  supply(amount: BigNumber): Promise<TransactionResponse> {
    return this.contract.mint(amount);
  }

  repay(amount: BigNumber, isMaxAmount: boolean): Promise<TransactionResponse> {
    if (!isMaxAmount) {
      return this.contract.repayBorrow(amount);
    } else {
      return this.contract.repayBorrow(MaxUint256);
    }
  }

  borrow(amount: BigNumber): Promise<TransactionResponse> {
    return this.contract.borrow(amount);
  }

  redeemUnderlying(amount: BigNumber): Promise<TransactionResponse> {
    return this.contract.redeemUnderlying(amount);
  }

  redeem(amount: BigNumber): Promise<TransactionResponse> {
    return this.contract.redeem(amount);
  }

  liquidateBorrow(
    borrower: string,
    repayAmount: BigNumber,
    ibTokenCollateral: string,
  ): Promise<TransactionResponse> {
    return this.contract.liquidateBorrow(borrower, repayAmount, ibTokenCollateral);
  }
}
