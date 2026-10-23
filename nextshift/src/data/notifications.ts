export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Local job',
    body: 'Walmart stocker opening in Saddle Brook.',
    time: '2h ago',
  },
  {
    id: 'n2',
    title: 'Local job',
    body: 'Whole Foods flex shopper shifts posted in Edgewater.',
    time: 'Yesterday',
  },
  {
    id: 'n3',
    title: 'Local job',
    body: 'Part-time library assistant hours added in Jersey City.',
    time: 'Mon',
  },
];
