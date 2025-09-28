import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);

  const day = date.getUTCDate();
  const month = date.toLocaleString('default', {
    month: 'short',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } as const;

  return date.toLocaleString('en-GB', options).replace(',', '');
};

export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatNumber(amount: number, decimalDigit: number = 0) {
  const formattedAmount = amount.toLocaleString('id-ID', {
    // style: 'currency',
    // currency: 'IDR',
    minimumFractionDigits: decimalDigit,
    maximumFractionDigits: decimalDigit,
  });

  return formattedAmount;
}

export const formatNumberFromString = (num: string) => {
  if (!num) return '';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomdata(totalData: number = 10) {
  const sampleSaleData = [];
  for (let i = 0; i < totalData; i++) {
    const qty = getRandomInt(1, 8);
    const price = getRandomInt(1000, 72300);
    sampleSaleData.push({
      name: `Item ${i + 1}`,
      qty: qty,
      price: price,
      total: qty * price,
    });
  }

  return sampleSaleData;
}

/**
 * Membulatkan angka ke kelipatan 50 terdekat.
 * @param {number} number Angka yang akan dibulatkan.
 * @returns {number} Hasil pembulatan sebagai integer.
 */
export function ceilToNearest100(number: number) {
  if (number <= 0) {
    return 0;
  }

  const result = Math.ceil(number / 100) * 100;

  return result;
}
export function exportToCsv(filename: string, rows: any[]) {
  const processRow = function (row: any) {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '';
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function ucwords(str: string) {
  // Convert the string to lowercase to ensure consistent capitalization
  const words = str.toLowerCase().split(' ');

  // Map over each word, capitalize its first letter, and lowercase the rest
  const capitalizedWords = words.map((word) => {
    if (word.length === 0) {
      return ''; // Handle empty words if any
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the capitalized words back into a single string
  return capitalizedWords.join(' ');
}
