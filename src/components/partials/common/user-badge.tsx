import Image from 'next/image';
import React from 'react';
import { BeatLoader } from 'react-spinners';

import IconAvatar from '@/assets/icons/icon-avatar.svg';
import { cn } from '@/lib/utils';

type UserBadgeProps = {
  size: number;
  avatarUrl?: string;
  className?: string;
};
const UserBadge: React.FC<UserBadgeProps> = ({
  avatarUrl,
  size,
  className = '',
}) => {
  const [isLoadError, setIsLoadError] = React.useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = React.useState(false);
  const defaultIcon = IconAvatar;

  return (
    <div className='relative shrink-0'>
      {!isAvatarLoaded && (
        <div className='absolute inset-0 z-2 flex items-center justify-start'>
          <BeatLoader color='#d5d7da' size={size - 2} />
        </div>
      )}

      <Image
        className={cn(`size-${size} rounded-full object-contain`, className)}
        src={isLoadError || !avatarUrl ? defaultIcon : avatarUrl}
        onError={() => setIsLoadError(true)}
        onLoad={() => setIsAvatarLoaded(true)}
        alt='user avatar'
        width={size}
        height={size}
      />
    </div>
  );
};

type UserBadgeOccupationProps = {
  avatarUrl: string;
  name: string;
  occupation: string;
  avatarUrlClassName?: string;
  nameClassName?: string;
  occupationClassName?: string;
  size?: number;
};
export const UserBadgeOccupation: React.FC<UserBadgeOccupationProps> = ({
  avatarUrl = '',
  name,
  occupation = 'Frontend Developer',
  avatarUrlClassName = '',
  nameClassName,
  occupationClassName,
  size = 12.5,
}) => {
  return (
    <div className='flex flex-col items-center justify-start gap-3'>
      <UserBadge
        className={avatarUrlClassName}
        avatarUrl={avatarUrl}
        size={size}
      />
      <div className='items-left flex flex-col justify-center'>
        <span
          className={cn(
            'text-sm-bold md:text-md-bold text-left text-neutral-900',
            nameClassName
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            'text-sm-regular md:text-md-regular text-neutral-900',
            occupationClassName
          )}
        >
          {occupation}
        </span>
      </div>
    </div>
  );
};

export default UserBadge;
