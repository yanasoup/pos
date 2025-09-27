import React from 'react';

import { cn } from '@/lib/utils';

const ContentWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'content-wrapper bg-sidebar w-full rounded-3xl p-2 md:p-4',
        className
      )}
    >
      {children}
    </div>
  );
};

export default ContentWrapper;
