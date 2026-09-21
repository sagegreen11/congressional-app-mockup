export type Job = {
  id: string;
  title: string;
  employer: string;
  location: string;
  city: string;
  entryLevel: boolean;
  transit: string;
  pay: string;
  type: string;
  summary: string;
};

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Grocery Associate',
    employer: 'Village Market Co-op',
    location: '215 Main St, Hackensack, NJ',
    city: 'Hackensack',
    entryLevel: true,
    transit: 'NJ Transit bus stop 2 blocks',
    pay: '$16–18 / hr',
    type: 'Full-time',
    summary: 'Stock shelves, greet shoppers, and keep the floor ready during daytime shifts.',
  },
  {
    id: 'j2',
    title: 'Retail Sales Associate',
    employer: 'Garden State Outfitters',
    location: 'Garden State Plaza, Paramus, NJ',
    city: 'Paramus',
    entryLevel: true,
    transit: 'NJ Transit 168 nearby',
    pay: '$15.50 / hr + commission',
    type: 'Part-time',
    summary: 'Help customers find sizes, keep displays tidy, and process sales on evenings and weekends.',
  },
  {
    id: 'j3',
    title: 'Front Desk Assistant',
    employer: 'Teaneck Community Clinic',
    location: '90 Queen Anne Rd, Teaneck, NJ',
    city: 'Teaneck',
    entryLevel: true,
    transit: 'Walkable from Cedar Lane bus',
    pay: '$18 / hr',
    type: 'Full-time',
    summary: 'Check in visitors, answer phones, and keep appointment lists current.',
  },
  {
    id: 'j4',
    title: 'Warehouse Helper',
    employer: 'Overpeck Logistics',
    location: '40 River Dr, Garfield, NJ',
    city: 'Garfield',
    entryLevel: true,
    transit: 'Passaic-Garfield rail 8 min walk',
    pay: '$17 / hr',
    type: 'Full-time',
    summary: 'Pick, pack, and move boxes in a small warehouse with on-the-job training.',
  },
  {
    id: 'j5',
    title: 'Café Crew',
    employer: 'Bridgeview Coffee',
    location: '12 Center Ave, Fort Lee, NJ',
    city: 'Fort Lee',
    entryLevel: true,
    transit: 'NYC bus terminal 5 min walk',
    pay: '$15 / hr + tips',
    type: 'Part-time',
    summary: 'Take orders, make drip coffee, and keep a small café clean during morning rush.',
  },
  {
    id: 'j6',
    title: 'Library Page',
    employer: 'Johnson Public Library',
    location: '274 Main St, Hackensack, NJ',
    city: 'Hackensack',
    entryLevel: true,
    transit: 'On Main Street bus corridor',
    pay: '$16 / hr',
    type: 'Part-time',
    summary: 'Shelve books, help visitors find rooms, and support weekend programs.',
  },
];
