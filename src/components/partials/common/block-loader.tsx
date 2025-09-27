'use client';
import React from 'react';
import { BeatLoader } from 'react-spinners';

const BlockLoader = ({
  loaderText = 'Mengakhiri sesi...',
}: {
  loaderText?: string;
}) => {
  return (
    <div className='absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-600 opacity-70'>
      <BeatLoader color='#a3ced0' />
      <span className='text-neutral-300'>{loaderText}</span>
    </div>
  );
};

export default BlockLoader;
