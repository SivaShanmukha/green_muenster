import type { Journey } from '../types';

export function exportJourneysToCSV(journeys: Journey[], filename: string = 'green-munster-journeys.csv') {
  // Define CSV headers
  const headers = [
    'Date',
    'Time',
    'From',
    'To',
    'Transport Mode',
    'Distance (km)',
    'Duration (min)',
    'CO2 Emitted (kg)',
    'CO2 Saved (kg)'
  ];

  // Convert journeys to CSV rows
  const rows = journeys.map(journey => {
    const date = new Date(journey.createdAt);
    return [
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      journey.from,
      journey.to,
      journey.mode.charAt(0).toUpperCase() + journey.mode.slice(1),
      journey.distance.toFixed(2),
      Math.round(journey.duration).toString(),
      (journey.co2Grams / 1000).toFixed(3),
      (journey.co2Saved / 1000).toFixed(3)
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
