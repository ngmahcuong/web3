import { BigNumber } from 'ethers';

export enum IDOStatus {
  Inactive,
  Active,
  Cancel,
}

export enum Status {
  Inactive,
  Upcomming,
  Salelive,
  Ended,
  Claimable,
  Cancel,
}

export type LaunchpadInfo = {
  status: IDOStatus;
  startTime: BigNumber;
  endTime: BigNumber;
  withdrawDelay: number;
  salePrice: BigNumber;
  saleAmount: BigNumber;
  minEthPayment: BigNumber;
  maxEthPayment: BigNumber;
  purchaserCount: number;
  totalPaymentReceive?: BigNumber;
};

export type UserInfo = {
  paymentAmount: BigNumber;
  chaiAmount: BigNumber;
  claimed: boolean;
  isWhitelist: boolean;
};

export type MerkleTreeClaimAccount = {
  proof?: string[];
  index?: number;
  amount?: BigNumber;
};
