import React from 'react';
import { carouselData } from '@/constants/carousel-data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
const LoginCarousel = () => {
  const plugin = React.useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: false,
    })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className='flex w-full min-w-80 flex-1 items-center justify-center p-4'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className='h-full'>
        <CarouselItem
          key={10}
          className='inset-0 flex w-full flex-col items-center justify-center'
        >
          <div className='flex h-40 w-60 gap-2 rounded-xl bg-gradient-to-b from-neutral-700 to-neutral-800 p-4 md:h-50 md:w-75 xl:h-100 xl:w-150'>
            <Image
              src='/carousel/img3.png'
              alt='title'
              width={600}
              height={400}
              priority={true}
              className='h-auto w-3/4 object-contain object-center'
            />
            <Image
              src='/carousel/img9.png'
              alt='title'
              width={600}
              height={400}
              priority={true}
              className='h-auto w-1/5 object-contain object-center'
            />
          </div>
          <div className='pt-4 text-xs text-neutral-800 md:text-sm'>
            Aplikasi Penjualan untuk retail versi web/desktop dan mobile. Dengan
            fitur penjualan, pembayaran dan laporan. Data saling terkoneksi
            antara versi web dan aplikasi mobile.
          </div>
        </CarouselItem>

        {carouselData.map((item) => (
          <CarouselItem
            key={item.id}
            className='inset-0 flex w-full flex-col items-center justify-center'
          >
            <Image
              src={item.image}
              alt='title'
              width={600}
              height={400}
              priority={true}
              className='max-h-100 rounded-xl bg-gradient-to-b from-neutral-700 to-neutral-800 object-contain object-center p-4 lg:h-100 lg:w-150'
            />

            <div className='pt-4 text-xs text-neutral-800 md:text-sm'>
              {item.description}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious className='hidden text-black md:inline-flex' />
    <CarouselNext className='hidden text-black md:inline-flex' /> */}
    </Carousel>
  );
};

export default LoginCarousel;
