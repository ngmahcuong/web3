import { BigNumber } from 'ethers';
import { formatUnits, Interface } from 'ethers/lib/utils';
import {
  getAllMarketsConfig,
  getTokenConfig,
  getNativeTokenSymbol,
  getTokenAddress,
  getLensAddress,
  getComptrollerAddress,
} from '../../../config';
import { Call, CallResult } from '@reddotlabs/multicall';
import { BlocksPerDay, LendingPrecision, BlocksPerYear } from '../../../utils/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import CompoundLensAbi from '../../../abis/CompoundLens.json';
import { CompoundLensInterface } from '../../../typechain/CompoundLens';
import { QueuedMulticall } from '@reddotlabs/multicall-react';
import { Zero } from '@ethersproject/constants';
import { Market, MarketConfig, UserPositionInMarket } from '../models/Lending';

const LensInterface = new Interface(CompoundLensAbi) as CompoundLensInterface;

export abstract class BaseMarket {
  protected config: MarketConfig;
  protected lens: string;
  protected comptroller: string;

  constructor(
    protected chainId: number,
    protected signer: JsonRpcSigner,
    public address: string,
    protected multicall: QueuedMulticall,
  ) {
    this.comptroller = getComptrollerAddress(chainId);
    this.lens = getLensAddress(chainId);
    this.config = getAllMarketsConfig(this.chainId).find(
      (t) => t.marketAddress === this.address,
    );
  }

  protected getInfoCall(): Call[] {
    return [
      {
        target: this.address,
        signature: 'supplyRatePerBlock() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'exchangeRateStored() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'borrowRatePerBlock() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'reserveFactorMantissa() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'totalBorrows() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'totalReserves() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'totalSupply() returns (uint256)',
      },
      {
        target: this.address,
        signature: 'getCash() returns (uint256)',
      },
      {
        target: this.comptroller,
        signature:
          'markets(address) external view returns (bool isListed, uint256 collateralFactor)',
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'rewardSpeeds(address) external view returns (uint256)',
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'borrowCaps(address) external view returns (uint256)',
        params: [this.address],
      },
      {
        target: this.lens,
        abi: LensInterface.functions['cTokenUnderlyingPrice(address)'],
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'liquidationThreshold(address) view returns (uint256)',
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'liquidationIncentive(address) view returns (uint256)',
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'mintGuardianPaused(address) external view returns (bool)',
        params: [this.address],
      },
      {
        target: this.comptroller,
        signature: 'borrowGuardianPaused(address) external view returns (bool)',
        params: [this.address],
      },
    ];
  }

  protected parseResponse(result: CallResult[]) {
    return {
      supplyRatePerBlock: result[0][0] as BigNumber,
      exchangeRateStored: result[1][0] as BigNumber,
      borrowRatePerBlock: result[2][0] as BigNumber,
      reserveFactor: result[3][0] as BigNumber,
      totalBorrows: result[4][0] as BigNumber,
      totalReserves: result[5][0] as BigNumber,
      totalSupply: result[6][0] as BigNumber,
      cash: result[7][0] as BigNumber,
      isListed: result[8][0] as boolean,
      collateralFactor: result[8][1] as BigNumber,
      compSpeed: result[9][0] as BigNumber,
      borrowCap: result[10][0] as BigNumber,
      underlyingPrice: result[11][0][1] as BigNumber,
      liquidationThreshold: result[12][0] as BigNumber,
      liquidationIncentive: result[13][0] as BigNumber,
      mintPaused: result[14][0] as boolean,
      borrowPaused: result[15][0] as boolean,
    };
  }

  async info(): Promise<Market> {
    const config = this.config;
    const assetToken = getTokenConfig(this.chainId, config.asset);
    const nativeToken = getNativeTokenSymbol(this.chainId);

    const calls = this.getInfoCall();
    const response = await this.multicall.enqueue(calls);

    const info = this.parseResponse(response);

    const supplyApy =
      Math.pow(+formatUnits(info.supplyRatePerBlock, 18) * BlocksPerDay + 1, 365) - 1;
    const borrowApy =
      Math.pow(+formatUnits(info.borrowRatePerBlock, 18) * BlocksPerDay + 1, 365) - 1;

    const totalUnderlyingSupply = info.totalSupply
      .mul(info.exchangeRateStored)
      .div(LendingPrecision);

    return {
      ...config,
      isNativeToken: config.isNativeToken,
      isListed: info.isListed,
      assetAddress: config.asset === nativeToken ? config.asset : assetToken?.address,
      assetDecimals: config.asset === nativeToken ? 18 : assetToken?.decimals,
      marketAddress: this.address,
      exchangeRate: info.exchangeRateStored,
      cash: info.cash,
      totalSupply: info.totalSupply,
      totalReserves: info.totalReserves,
      totalBorrows: info.totalBorrows,
      supplyRatePerBlock: info.supplyRatePerBlock,
      supplyRatePerYear: info.supplyRatePerBlock.mul(BlocksPerYear),
      borrowRatePerBlock: info.borrowRatePerBlock,
      borrowRatePerYear: info.borrowRatePerBlock.mul(BlocksPerYear),
      collateralFactor: info.collateralFactor,
      compSpeed: info.compSpeed,
      reserveFactor: info.reserveFactor,
      borrowCap: info.borrowCap,
      totalUnderlyingSupply,
      supplyApy,
      borrowApy,
      marketLiquidity: info.cash.gte(info.totalReserves)
        ? info.cash.sub(info.totalReserves)
        : Zero,
      underlyingPrice: info.underlyingPrice,
      totalSupplyValue: info.underlyingPrice
        .mul(info.totalSupply)
        .mul(info.exchangeRateStored)
        .div(LendingPrecision)
        .div(LendingPrecision),
      totalBorrowValue: info.underlyingPrice.mul(info.totalBorrows).div(LendingPrecision),
      liquidationIncentive: info.liquidationIncentive,
      liquidationThreshold: info.liquidationThreshold,
      mintPaused: info.mintPaused,
      borrowPaused: info.borrowPaused,
    };
  }

  async userInfo(account: string): Promise<UserPositionInMarket> {
    const config = this.config;
    const data = await this.multicall.enqueue([
      {
        target: this.address,
        signature: 'balanceOf(address) returns (uint)',
        params: [account],
      },
      {
        target: this.address,
        signature: 'borrowBalanceStored(address) returns (uint)',
        params: [account],
      },
    ]);
    return {
      marketAddress: this.address,
      underlying: getTokenAddress(this.chainId, config.asset),
      underlyingSymbol: config.asset,
      xTokenBalance: data[0][0] as BigNumber,
      borrowBalance: data[1][0] as BigNumber,
    };
  }

  async interestRateModel(): Promise<string> {
    const [[address]] = await this.multicall.enqueue([
      {
        target: this.address,
        signature: 'interestRateModel() returns (address)',
      },
    ]);
    return address;
  }
}
