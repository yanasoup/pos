'use client';

import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '@/components/login-form';
import React from 'react';
import Image from 'next/image';
import ImageSlideshow from '@/components/partials/common/image-slideshow';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex items-center justify-center gap-2 md:justify-between'>
          <a href='#' className='flex items-center gap-2 font-medium'>
            <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
              <GalleryVerticalEnd className='size-4' />
            </div>
            POS Retail
          </a>
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm />
          </div>
        </div>

        <div className='w-full flex-col items-end justify-center px-8 pb-8'>
          <div className='flex flex-col items-center justify-center'>
            <Link
              href='https://expo.dev/accounts/yanasoup/projects/kasir-pos-mobile/builds/b815342a-3fcf-4d9e-a795-aa9c31476ab5'
              target='_blank'
            >
              <div className='to-accent from-secondary flex items-center rounded-md border bg-gradient-to-br px-6 py-1.5 shadow hover:opacity-90'>
                <Image
                  src='/icons/android-icon.png'
                  alt='playstore'
                  width={64}
                  height={64}
                  className='size-8'
                />
                <p className='text-[0.625rem] font-semibold'>Download App</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className='bg-background relative hidden items-center justify-center lg:block'>
        <ImageSlideshow />
        <div className='absolute top-6 right-6 z-100 hidden md:block lg:top-10 lg:right-10'>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
