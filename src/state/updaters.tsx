import ApplicationUpdater from './application/updater';
import TransactionUpdater from './transactions/updater';
import UserUpdater from './user/updater';
import TokensUpdater from './tokens/updater';

export const Updaters: React.FC = () => {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <TokensUpdater />
    </>
  );
};
