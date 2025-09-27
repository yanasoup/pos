import React from 'react';
import { Input } from './ui/input';

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};
const DataTableSearchBox: React.FC<Props> = ({
  searchValue,
  onSearchChange,
}) => {
  console.log('render DataTableSearchBox');
  return (
    <Input
      placeholder='Filter kategori...'
      value={searchValue}
      // value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
      onChange={
        (event) => {
          // setPagination({
          //   pageIndex: 0,
          //   pageSize: pageSize,
          // });
          onSearchChange(event.target.value);
        }
        // table.getColumn('name')?.setFilterValue(event.target.value)
      }
      className='max-w-sm'
      autoFocus
    />
  );
};

export default React.memo(DataTableSearchBox);
