import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FormControl } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils'; // Utilitas shadcn

// Definisikan tipe untuk props Combobox
interface ComboboxOption {
  value: string;
  label: string;
}

interface ReusableComboboxProps {
  // Properti yang datang dari React Hook Form Controller
  field: ControllerRenderProps;
  // Data opsi untuk Combobox
  options: ComboboxOption[];
  // Placeholder untuk input
  placeholder?: string;
  // Label untuk Combobox
  label?: string;
}

export function ReusableCombobox({
  field,
  options,
  placeholder = 'Pilih opsi...',
  label,
}: ReusableComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(
    (option) => option.value === field.value
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant='outline'
            role='combobox'
            className={cn(
              'w-full justify-between',
              !field.value && 'text-muted-foreground'
            )}
          >
            {field.value ? selectedLabel : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
        <Command>
          <CommandInput
            placeholder={`Cari ${label ? label.toLowerCase() : 'opsi'}...`}
          />
          <CommandList>
            <CommandEmpty>Tidak ada opsi ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  onSelect={() => {
                    // PENTING: Gunakan field.onChange untuk memperbarui nilai form
                    field.onChange(option.value);
                    setOpen(false); // Tutup popover setelah memilih
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      option.value === field.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
