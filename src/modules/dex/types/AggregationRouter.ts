import { Zero } from '@ethersproject/constants';
import { Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, CallOverrides, Contract, Signer, VoidSigner } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import AggregationRouterAbi from '../../../abis/AggregationRouter.json';
import { AggregationRouterInterface } from '../../../typechain/AggregationRouter';
import { ETH_ADDRESS } from '../../../utils/constants';
import { calculateGasMargin } from '../hooks/useEstimateContract';
import {
  AdapterType,
  serializeCallDescription,
  SwapStep,
  transformDescription,
} from './SwapExecutor';

const aggregationRouterInterface = new Interface(
  AggregationRouterAbi,
) as AggregationRouterInterface;

export class AggregationRouter extends Contract {
  constructor(address: string, provider: Signer | Provider) {
    super(address, aggregationRouterInterface, provider);
  }

  connect(signerOrProvider: string | Signer | Provider): AggregationRouter {
    if (typeof signerOrProvider === 'string') {
      signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
    }
    return new AggregationRouter(this.address, signerOrProvider);
  }

  async swap(
    executor: string,
    amountIn: BigNumberish,
    calls: SwapStep[],
    minReturnAmount: BigNumberish,
    to: string,
    deadline: number,
    gasPrice: BigNumber,
    permit = '0x',
    override?: CallOverrides,
  ) {
    const transformedDescriptions = calls.map(transformDescription);
    const serializedDescription = serializeCallDescription(transformedDescriptions);
    const srcReceiver = calls[0].adapter === AdapterType.uniswapV2 ? calls[0].pair : executor;
    const srcToken = transformedDescriptions[0].fromToken;
    const dstToken = transformedDescriptions[transformedDescriptions.length - 1].toToken;

    const estimatedGasLimit = await this.estimateGas.swap(
      executor,
      {
        srcToken,
        dstToken,
        srcReceiver,
        dstReceiver: to,
        spentAmount: amountIn,
        minReturnAmount,
        permit,
        deadline,
      },
      serializedDescription,
      Object.assign({}, override, {
        value: srcToken === ETH_ADDRESS ? amountIn : 0,
      }),
    );

    return await this.functions.swap(
      executor,
      {
        srcToken,
        dstToken,
        srcReceiver,
        dstReceiver: to,
        spentAmount: amountIn,
        minReturnAmount,
        permit,
        deadline,
      },
      serializedDescription,
      Object.assign(
        {},
        override,
        {
          value: srcToken === ETH_ADDRESS ? amountIn : 0,
          gasLimit: calculateGasMargin(estimatedGasLimit),
        },
        gasPrice?.gt(Zero) && {
          gasPrice,
        },
      ),
    );
  }
}
