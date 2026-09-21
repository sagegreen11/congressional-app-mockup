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
    body: 'New grocery associate opening in Hackensack.',
    time: '2h ago',
  },
  {
    id: 'n2',
    title: 'Local job',
    body: 'Café crew shifts posted in Fort Lee.',
    time: 'Yesterday',
  },
  {
    id: 'n3',
    title: 'Local job',
    body: 'Library page hours added near Main Street.',
    time: 'Mon',
  },
];
