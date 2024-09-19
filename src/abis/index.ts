import { Interface } from 'ethers/lib/utils';
import { MultiFeeDistributionInterface } from '../typechain/MultiFeeDistribution';
import { IERC20Interface } from '../typechain/IERC20';
import { ComptrollerInterface } from '../typechain/Comptroller';
import { MasterChefInterface } from '../typechain/MasterChef';
import { LockdropInterface } from '../typechain/Lockdrop';
import { LaunchpadInterface } from '../typechain/Launchpad';
import { SwapExecutorInterface } from '../typechain/SwapExecutor';
import { AggregationRouterInterface } from '../typechain/AggregationRouter';

import MultiFeeDistributionAbi from './MultiFeeDistribution.json';
import ERC20Abi from './IERC20.json';
import LockdropAbi from './Lockdrop.json';
import StakingAbi from './Staking.json';
import LaunchpadAbi from './Launchpad.json';
import ComptrollerAbi from './Comptroller.json';
import MasterChefAbi from './MasterChef.json';
import BasePoolAbi from './BasePool.json';
import StableSwapZapAbi from './StableSwapZap.json';

import { BasePoolInterface } from '../typechain/BasePool';
import { StableSwapZapInterface } from '../typechain/StableSwapZap';

import { UniswapV2FactoryInterface } from '../typechain/UniswapV2Factory';
import { UniswapV2PairInterface } from '../typechain/UniswapV2Pair';
import { UniswapV2Router02Interface } from '../typechain/UniswapV2Router02';

import LimitOrderAbi from './LimitOrder.json';
import FactoryAbi from './UniswapV2Factory.json';
import PairAbi from './UniswapV2Pair.json';
import SwapRouterAbi from './UniswapV2Router02.json';
import WETHAbi from './WETH.json';
import SwapExecutorAbi from './SwapExecutor.json';
import AggregationRouterAbi from './AggregationRouter.json';
import FluxOracleAbi from './FluxOracle.json';
import { WETHInterface } from '../typechain/WETH';
import { StakingInterface } from '../typechain/Staking';
import { FluxOracleInterface } from '../typechain/FluxOracle';
import { LimitOrderInterface } from '../typechain/LimitOrder';

export const multiFeeDistributionInterface = new Interface(
  MultiFeeDistributionAbi,
) as MultiFeeDistributionInterface;
export const erc20Interface = new Interface(ERC20Abi) as IERC20Interface;

export const ContractInterfaces = {
  erc20: new Interface(ERC20Abi) as IERC20Interface,
  multiFeeDistribution: new Interface(MultiFeeDistributionAbi) as MultiFeeDistributionInterface,
  comptroller: new Interface(ComptrollerAbi) as ComptrollerInterface,
  masterChef: new Interface(MasterChefAbi) as MasterChefInterface,
  lockdrop: new Interface(LockdropAbi) as LockdropInterface,
  staking: new Interface(StakingAbi) as StakingInterface,
  factoryInterface: new Interface(FactoryAbi) as UniswapV2FactoryInterface,
  swapRouterInterface: new Interface(SwapRouterAbi) as UniswapV2Router02Interface,
  pairInterface: new Interface(PairAbi) as UniswapV2PairInterface,
  wethInterface: new Interface(WETHAbi) as WETHInterface,
  launchpadInterface: new Interface(LaunchpadAbi) as LaunchpadInterface,
  fluxOracleInterface: new Interface(FluxOracleAbi) as FluxOracleInterface,
  limitOrderInterface: new Interface(LimitOrderAbi) as LimitOrderInterface,
  swapExecutorInterface: new Interface(SwapExecutorAbi) as SwapExecutorInterface,
  aggregationRouterInterface: new Interface(AggregationRouterAbi) as AggregationRouterInterface,
  basePool: new Interface(BasePoolAbi) as BasePoolInterface,
  stableSwapZap: new Interface(StableSwapZapAbi) as StableSwapZapInterface,
};

export type ContractType = keyof typeof ContractInterfaces;
