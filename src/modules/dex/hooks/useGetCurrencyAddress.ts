import { useEffect, useState } from 'react';
import { useDexNativeToken } from './useDexNativeToken';

export const useGetCurrencyAddress = (currencyId: string) => {
  const [address, setAddress] = useState(String);
  const nativeToken = useDexNativeToken();

  useEffect(() => {
    if (!currencyId) {
      return;
    }
    if (currencyId === nativeToken?.symbol) {
      setAddress(nativeToken?.wrapped?.address);
    } else {
      setAddress(currencyId);
    }
  }, [currencyId, nativeToken]);

  return address;
};
