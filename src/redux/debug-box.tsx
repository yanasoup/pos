'use client';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';

import { RootState } from './store';

const DebugBox = ({
  visible = true,
  className,
  pretify = false,
}: {
  visible?: boolean;
  className?: string;
  pretify?: boolean;
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  return (
    <div
      className={cn(
        'custom-container text-xs-regular min-h-25 w-full overflow-scroll rounded-lg border border-dashed p-2',
        visible ? 'block' : 'hidden',
        className
      )}
    >
      {pretify && (
        <pre className='h-50 overflow-auto'>
          {JSON.stringify(uiuxState, null, '\t')}
        </pre>
      )}
      {!pretify && JSON.stringify(uiuxState)}
    </div>
  );
};

export default DebugBox;
