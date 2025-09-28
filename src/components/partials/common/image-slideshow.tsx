'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import slide1 from '@/assets/slideshow/kasir-pos-app.png';
import slide1b from '@/assets/slideshow/img1b.png';
import slide2 from '@/assets/slideshow/img2.png';
import slide3 from '@/assets/slideshow/img3.png';
import slide4 from '@/assets/slideshow/img4.png';
import slide4b from '@/assets/slideshow/img4b.png';
import slide5 from '@/assets/slideshow/img5.png';
import slide6 from '@/assets/slideshow/img6.png';
import slide7 from '@/assets/slideshow/img7.png';
import slide8 from '@/assets/slideshow/img8.png';

import { cn } from '@/lib/utils';

const images = [
  {
    image: slide1,
    alt: 'slide1',
    description:
      'Pantau ringkasan transaksi dan performa usaha anda dengan cepat tanpa harus melihat ke menu laporan.',
  },
  {
    image: slide1b,
    alt: 'slide1b',
    description:
      'Pantau ringkasan transaksi dan performa usaha anda dengan cepat tanpa harus melihat ke menu laporan.',
  },
  {
    image: slide2,
    alt: 'slide2',
    description: 'Atur margin dan persentase margin item',
  },
  {
    image: slide3,
    alt: 'slide3',
    description:
      'Support barcode scanner, dan cetak langsung ke printer kasir.',
  },
  {
    image: slide4,
    alt: 'slide4',
    description:
      'Menu Pembayaran Kasir. Support diskon faktur, QRIS dan lainnya.',
  },
  {
    image: slide4b,
    alt: 'slide4b',
    description:
      'Support barcode scanner, dan cetak langsung ke printer kasir.',
  },
  {
    image: slide5,
    alt: 'slide5',
    description:
      'Awasi penjualan & saldo kasir setiap shift, transparan dan akurat.',
  },
  {
    image: slide6,
    alt: 'slide6',
    description: 'Pantau laporan penjualan dan margin harian',
  },
  {
    image: slide8,
    alt: 'slide8',
    description: (
      <p>
        Sesuaikan tampilan aplikasi sesuai gaya Anda, dukung mode terang &
        gelap. Nyaman digunakan siang atau malam dengan fitur theme switcher.
      </p>
    ),
  },
  {
    image: slide7,
    alt: 'slide7',
    description: (
      <p>
        <span className='text-primary font-bold'>
          Aplikasi Kasir Mobile Android.
        </span>{' '}
        Aplikasi ini membantu menginputkan data transaksi tanpa harus berada di
        depan PC kasir anda.{' '}
        <span className='text-primary'>
          Data akan terkoneksi dengan data yang sama yang berada di PC kasir
        </span>{' '}
        sehingga anda bisa memberikan pelayanan yang cepat namun tetap akurat
        kepada pelanggan anda. Aplikasi Kasir Mobile Android termasuk dalam
        paket penjualan.
      </p>
    ),
  },
];

export default function ImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative flex h-full w-full overflow-hidden'>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'absolute top-0 left-0 z-0 h-full w-full translate-x-[-1rem] scale-110 rotate-[-5deg] transform place-content-center place-items-center object-contain px-10 opacity-0 transition-all duration-1000 ease-in-out',
            index === currentImageIndex
              ? 'z-100 translate-x-0 scale-100 rotate-0 transform opacity-100'
              : ''
          )}
        >
          <div key={index}>
            <Image
              key={index}
              src={image.image}
              // className={cn(
              //   'absolute top-0 left-0 z-0 h-full w-full translate-x-[-1rem] scale-110 rotate-[-5deg] transform object-contain px-10 opacity-0 transition-all duration-500 ease-in-out',
              //   index === currentImageIndex
              //     ? 'z-100 translate-x-0 scale-100 rotate-0 transform opacity-100'
              //     : ''
              // )}
              className='max-h-[50vh] w-full rounded-lg object-contain'
              alt={image.alt}
              priority={true}
            />
          </div>
          <div className='mt-6'>{image?.description || image?.alt}</div>
        </div>
      ))}
    </div>
  );
}
