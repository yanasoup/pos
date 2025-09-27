import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';

// type MySelectProps = {
interface MySelectProps extends React.ComponentProps<typeof Select> {
  options: { value: string; label: string }[];
  placeholder: string;
  optionsTitle: string;
  className?: string;
  value?: string;
  onChange: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export const MySelect: React.FC<MySelectProps> = ({
  options,
  placeholder,
  optionsTitle,
  className,
  value,
  onChange,
  onKeyDown,
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        onKeyDown={onKeyDown}
        className={cn(
          'text-sm-regular placeholder:text-muted-foreground h-12 w-full rounded-lg px-4 py-2 outline-none',
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 border focus:ring-[1px] focus-visible:ring-[3px]',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{optionsTitle}</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
