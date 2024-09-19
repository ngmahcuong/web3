import { useMemo } from 'react';
import { DexRecipient } from '../../../components/DexRecipient';

export type LimitOrderRecipientProps = {
  onChangeRecipient?: (recipient) => void;
  recipient?: string;
  recipientError?: string;
};
export const LimitOrderRecipient: React.FC<LimitOrderRecipientProps> = ({
  onChangeRecipient,
  recipient,
  recipientError,
}) => {
  const invalid = useMemo(() => {
    return recipientError && recipient?.length > 0;
  }, [recipient, recipientError]);

  return (
    <DexRecipient
      onChangeRecipient={onChangeRecipient}
      recipient={recipient}
      invalid={invalid}
    />
  );
};
