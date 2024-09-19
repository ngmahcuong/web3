import { JsonRpcSigner } from '@ethersproject/providers';
import { QueuedMulticall } from '@reddotlabs/multicall-react';
import { Contract } from 'ethers';
import { ContractInterfaces, ContractType } from '../abis';
import {
  getAggregationRouterAddress,
  getAllMarketsConfig,
  getStableCoinSymbol,
  getSwapExecutorAddress,
} from '../config';
import { AggregationRouter } from '../modules/dex/types/AggregationRouter';
import { SwapExecutor } from '../modules/dex/types/SwapExecutor';
import { Comptroller } from '../modules/lending/types/Comptroller';
import { Erc20Market } from '../modules/lending/types/Erc20Market';
import { EthMarket } from '../modules/lending/types/EtherMarket';
import { IComptroller } from '../modules/lending/types/interfaces/IComptroller';
import { IMarket } from '../modules/lending/types/interfaces/IMarket';
import { StableMarket } from '../modules/lending/types/StableCoinMarket';

export class ContractRegistry {
  markets: IMarket[];
  comptroller: IComptroller;
  swapExecutor: SwapExecutor;
  aggregationRouter: AggregationRouter;

  // Contracts instance cache
  private contracts = new Map<string, Contract>();

  constructor(chainId: number, private signer: JsonRpcSigner, multicall: QueuedMulticall) {
    this.comptroller = new Comptroller(chainId, multicall);
    const stableCoinSymbol = getStableCoinSymbol(chainId);

    this.markets = getAllMarketsConfig(chainId)?.map((market) => {
      if (market.isNativeToken) {
        return new EthMarket(chainId, signer, market.marketAddress, multicall);
      }
      if (market.asset === stableCoinSymbol) {
        return new StableMarket(chainId, signer, market.marketAddress, multicall);
      } else {
        return new Erc20Market(chainId, signer, market.marketAddress, multicall);
      }
    });

    this.swapExecutor = new SwapExecutor(getSwapExecutorAddress(chainId), signer);
    this.aggregationRouter = new AggregationRouter(
      getAggregationRouterAddress(chainId),
      signer,
    );

    // Cache custom contract
    this.contracts.set(
      `${'swapExecutorInterface'}:${getSwapExecutorAddress(chainId)}`,
      this.swapExecutor,
    );
    this.contracts.set(
      `${'aggregationRouterInterface'}:${getAggregationRouterAddress(chainId)}`,
      this.aggregationRouter,
    );
  }

  getMarketByAddress(address: string) {
    return this.markets.find((market) => market.address === address);
  }

  getContract(contractType: ContractType, address: string) {
    if (!address) {
      return null;
    }
    const key = `${contractType}:${address}`;
    if (this.contracts.has(key)) {
      return this.contracts.get(key);
    }
    const iface = ContractInterfaces[contractType];
    const contract = new Contract(address, iface, this.signer);
    this.contracts.set(key, contract);
    return contract;
  }
}
