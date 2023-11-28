'use client';

import { useState, type FunctionComponent } from 'react';
import LockerUnlockForm from '~/components/locker-unlock-form';
import LockerDetail from '~/components/locker-detail';

type LockerInfoProps = {
  type: 'client' | 'operator';
};

const LockerInfo: FunctionComponent<LockerInfoProps> = ({ type }) => {
  const [isUnlocked, setIsUnLocked] = useState(false);

  if (isUnlocked) {
    return (
      <LockerDetail
        locker={{
          nickname: 'Test1',
          state: 'Reservado',
          isOpen: false,
          isEmpty: true,
          sizes: {
            height: 10,
            width: 10,
            depth: 10,
          },
        }}
      />
    );
  }

  return <LockerUnlockForm type={type} onSucess={() => setIsUnLocked(true)} />;
};

export default LockerInfo;
