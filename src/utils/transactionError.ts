const ErrorMessages: Record<string, string> = {};

type ChainError = {
  code: number;
  message: string;
  data: {
    code: number;
    message: string;
    data: string;
  };
};

const isRevert = (tx: any): tx is ChainError => {
  return tx.code === -32603 && tx.data;
};

const isDenied = (tx: any) => {
  return tx.code === 4001;
};

const isInvalidArgument = (tx: any) => {
  return tx.code === 'INVALID_ARGUMENT';
};

export const getErrorMessage = (tx: any) => {
  if (tx?.error?.code === -32603) {
    const message = tx?.error?.message.replace('execution reverted: ', '');
    return message;
  }
  if (isDenied(tx)) {
    return 'User denied transaction confirmation';
  }
  if (isRevert(tx)) {
    if (tx.data?.message.startsWith('execution reverted: ')) {
      const message = tx.data.message.replace('execution reverted: ', '');
      return ErrorMessages[message] || message;
    }
  }
  if (isInvalidArgument(tx)) {
    return tx?.reason?.charAt(0)?.toUpperCase() + tx?.reason?.slice(1) || 'Invalid argument';
  }
  return tx.message;
};
