import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { cn } from '@/lib/utils';

type PagerProps = {
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export const Paginator: React.FC<PagerProps> = ({
  total = 0,
  page = 0,
  lastPage = 0,
  onPageChange,
  className,
}) => {
  const [currentPage, setCurrentPage] = React.useState(page);
  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(lastPage, page));
    setCurrentPage(clamped);
    onPageChange(clamped);
  };
  const renderPageNumbers = () => {
    const pageButtons = [];

    pageButtons.push(
      <PaginationItem key='prevBtn'>
        <PaginationPrevious
          onClick={() => goToPage(currentPage - 1)}
          // disabled={currentPage === 1}
          className='lg:text-regular text-regular text-xs lg:text-sm'
        />
      </PaginationItem>
    );

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || i === currentPage) {
        pageButtons.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => goToPage(i)}
              isActive={i === currentPage}
              className={cn(
                'lg:text-regular text-regular text-xs lg:text-sm',
                i === currentPage ? 'p-1 px-0 py-0' : 'p-1 px-0 py-0'
              )}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - 1 && currentPage > 1) ||
        (i === currentPage + 1 && currentPage < total - 3)
      ) {
        pageButtons.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className='lg:text-regular text-regular text-xs lg:text-sm' />
          </PaginationItem>
        );
      }
    }

    pageButtons.push(
      <PaginationItem key='nextBtn'>
        <PaginationNext
          onClick={() => goToPage(currentPage + 1)}
          // disabled={currentPage === lastPage}
          className='lg:text-sm-regular text-xs-regular'
        />
      </PaginationItem>
    );

    return pageButtons;
  };

  return (
    <Pagination
      className={(cn('paginator mt-6 flex flex-wrap justify-end'), className)}
    >
      <PaginationContent className='flex-center'>
        <span>Halaman : </span>
        {renderPageNumbers()}
      </PaginationContent>
    </Pagination>
  );
};
