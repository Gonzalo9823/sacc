'use client';

import { useState, type FunctionComponent } from 'react';
import LockerUnlockForm from '~/components/locker-unlock-form';
import LockerDetail from '~/components/locker-detail';
import type { Locker } from '~/interfaces/Locker';
import LockerOperatorConfirmForm from './locker-operator-confirm-form';

type LockerInfoProps = {
  type: 'client' | 'operator';
};

const LockerInfo: FunctionComponent<LockerInfoProps> = ({ type }) => {
  const [lockerData, setLockerData] = useState<{ locker: Locker & { loaded: boolean; confirmedOperator: boolean }; password: string }>();

  if (lockerData) {
    if (lockerData.locker.confirmedOperator) {
      return <LockerDetail locker={lockerData.locker} password={lockerData.password} type={type} />;
    }

    return (
      <LockerOperatorConfirmForm
        locker={lockerData.locker}
        password={lockerData.password}
        onSucess={(locker, password) => setLockerData({ locker, password })}
      />
    );
  }

  return <LockerUnlockForm type={type} onSucess={(locker, password) => setLockerData({ locker, password })} />;
};

export default LockerInfo;
