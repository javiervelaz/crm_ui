import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};


export const getCurrentDate = (timeZone: string = 'America/Argentina/Buenos_Aires') => {
  const currentDate = new Date();
  
  // Formatear según la zona horaria especificada
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    //hour: '2-digit',
    //minute: '2-digit',
    //second: '2-digit',
    //hour12: true // Formato 24 horas
  });
  
  const formatted = formatter.format(currentDate);
  const [month, day, year] = formatted.split('/');

  const localISODate = `${year}-${month}-${day}`;
  
  const data = {
    fecha: localISODate
  };
  return data;
}


// Moneda ARS para la UI: separador de miles, sin decimales de más ($10.000, $1.234,5).
export const formatMoney = (n: number | string | null | undefined) =>
  '$' + Number(n ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 });

// Fecha y hora 24 h en horario de Argentina (17/11/2026, 14:52). El default de es-AR
// del navegador es 12 h y en algunos entornos se ve sin a. m./p. m.
export const formatFechaHora = (
  value: string | number | Date,
  timeZone: string = 'America/Argentina/Buenos_Aires'
) =>
  new Date(value).toLocaleString('es-AR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
