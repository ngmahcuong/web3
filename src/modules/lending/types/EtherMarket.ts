import { Contract, BigNumber, Signer } from 'ethers';
import MEther from '../../../abis/MEther.json';
import { getREtherRepayDelegateAddress } from '../../../config';
import {
  MEther as MarketContract,
  EtherRepayDelegate as EtherRepayDeletgateContract,
} from '../../../typechain';
import { LendingPrecision } from '../../../utils/constants';
import { BaseMarket } from './BaseMarket';
import { IMarket } from './interfaces/IMarket';
import EtherRepayDelegate from '../../../abis/EtherRepayDelegate.json';
import { JsonRpcSigner, Provider, TransactionResponse } from '@ethersproject/providers';
import { QueuedMulticall } from '@reddotlabs/multicall-react';

export class EthMarket extends BaseMarket implements IMarket {
  private contract: MarketContract;
  private repayDelegate: EtherRepayDeletgateContract;

  constructor(
    chainId: number,
    signer: JsonRpcSigner,
    address: string,
    multicall: QueuedMulticall,
  ) {
    super(chainId, signer, address, multicall);
    this.contract = new Contract(address, MEther, signer) as MarketContract;
    this.repayDelegate = new Contract(
      getREtherRepayDelegateAddress(chainId),
      EtherRepayDelegate,
      signer,
    ) as EtherRepayDeletgateContract;
  }

  connect(signerOrProvider: Signer | Provider): void {
    this.contract = this.contract.connect(signerOrProvider);
    this.repayDelegate = this.repayDelegate.connect(signerOrProvider);
  }

  supply(amount: BigNumber): Promise<TransactionResponse> {
    return this.contract.mint({
      value: amount,
    });
  }

  async repay(
    amount: BigNumber,
    isMaxAmount: boolean,
    account: string,
  ): Promise<TransactionResponse> {
    if (!isMaxAmount) {
      return await this.contract.repayBorrow({
        value: amount,
      });
    }

    const [lastAccrual, borrowRatePerBlock, currentBlock] = await Promise.all([
      this.contract.accrualBlockNumber(),
      this.contract.borrowRatePerBlock(),
      this.getBlockNumber(),
    ]);

    const estimatedAmount = borrowRatePerBlock
      .mul(currentBlock + 100 - lastAccrual.toNumber()) // add a timeout of 100 blocks
      .add(LendingPrecision)
      .mul(amount)
      .div(LendingPrecision);

    return this.repayDelegate.repayBehalf(account, {
      value: estimatedAmount,
    });
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

  async redeemAll(): Promise<TransactionResponse> {
    return this.contract.redeem(await this.contract.balanceOf(await this.signer.getAddress()));
  }

  liquidateBorrow(
    borrower: string,
    repayAmount: BigNumber,
    ibTokenCollateral: string,
  ): Promise<TransactionResponse> {
    return this.contract.liquidateBorrow(borrower, ibTokenCollateral, {
      value: repayAmount,
    });
  }

  private getBlockNumber() {
    return this.signer.provider.getBlockNumber();
  }
}
