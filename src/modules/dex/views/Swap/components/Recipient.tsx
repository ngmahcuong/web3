import { useMemo } from 'react';
import { useRecipient, useSwapActionHandlers } from '../../../../../state/dex/hooks';
import { DexRecipient } from '../../../components/DexRecipient';

export type RecipientProps = {
  recipientError?: string;
};
export const Recipient: React.FC<RecipientProps> = ({ recipientError }) => {
  const { onChangeRecipient } = useSwapActionHandlers();
  const recipient = useRecipient();
  const isRecipientInvalid = useMemo(() => {
    return recipientError && recipient?.length > 0;
  }, [recipient, recipientError]);

  return (
    <DexRecipient
      invalid={isRecipientInvalid}
      recipient={recipient}
      onChangeRecipient={onChangeRecipient}
    />
  );
};
