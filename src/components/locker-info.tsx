'use client';

import { useState, type FunctionComponent } from 'react';
import LockerUnlockForm from '~/components/locker-unlock-form';
import LockerDetail from '~/components/locker-detail';
import type { Locker } from '~/interfaces/Locker';

type LockerInfoProps = {
  type: 'client' | 'operator';
};

const LockerInfo: FunctionComponent<LockerInfoProps> = ({ type }) => {
  const [lockerData, setLockerData] = useState<{ locker: Locker & { loaded: boolean }; password: string }>();

  if (lockerData) {
    return <LockerDetail locker={lockerData.locker} password={lockerData.password} type={type} />;
  }

  return <LockerUnlockForm type={type} onSucess={(locker, password) => setLockerData({ locker, password })} />;
};

export default LockerInfo;
