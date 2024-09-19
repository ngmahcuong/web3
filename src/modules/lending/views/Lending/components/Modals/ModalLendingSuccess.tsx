import React from 'react';
import { useTokenConfig } from '../../../../../../hooks/useTokenConfig';
import { ModalSuccess } from '../../../../../../components/ModalSuccess';

export type ModalLendingSuccessProps = {
  symbol?: string;
  message: string;
  tx: string;
  onDismiss?: () => void;
  hideMetamaskButton?: boolean;
  title?: string;
};

export const ModalLendingSuccess: React.FC<ModalLendingSuccessProps> = (props) => {
  const token = useTokenConfig(props?.symbol);

  return (
    <ModalSuccess
      {...props}
      symbol={token?.name}
      address={token?.address}
      decimals={token?.decimals}
    />
  );
};
