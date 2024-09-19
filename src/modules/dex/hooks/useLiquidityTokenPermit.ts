import { BigNumber } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';
import { useCallback, useState } from 'react';
import { useUniswapToken } from './useUniswapToken';
import { useUniswapPair } from './useUniswapPair';
import { useGetDeadline } from '../../../state/application/hooks';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { getSwapRouterAddress } from '../../../config';

export const useLiquidityTokenPermit = (liquidityToken: string, inputAmount: BigNumber) => {
  const { account, library, chainId } = useUserWallet();
  const [enabling, setEnabling] = useState(false);
  const [signatureData, setSignatureData] = useState<{
    v: number;
    r: string;
    s: string;
    deadline: number;
  } | null>(null);

  const getDeadLine = useGetDeadline();

  const pairContract = useUniswapPair(liquidityToken);
  const lpToken = useUniswapToken(liquidityToken);

  const swapRouter = getSwapRouterAddress(chainId);

  const gatherPermitSignature = useCallback(async () => {
    if (!pairContract || !library || !chainId || !swapRouter || !lpToken?.name) return;
    setEnabling(true);
    const liquidityAmount = inputAmount;

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);
    const deadline = getDeadLine();

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: lpToken?.name,
      version: '1',
      chainId,
      verifyingContract: liquidityToken,
    };
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: account,
      spender: swapRouter,
      value: liquidityAmount.toHexString(),
      nonce: nonce.toHexString(),
      deadline,
    };
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature) => {
        setEnabling(false);
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline,
        });
      })
      .catch(() => {
        setEnabling(false);
      });
  }, [
    account,
    chainId,
    getDeadLine,
    inputAmount,
    library,
    liquidityToken,
    lpToken?.name,
    pairContract,
    swapRouter,
  ]);

  const resetSignature = useCallback(() => {
    setSignatureData(null);
  }, []);
  return {
    gatherPermitSignature,
    resetSignature,
    enabling,
    signatureData,
  };
};
