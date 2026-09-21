export type ResourceCategory = 'clinics' | 'food' | 'childcare' | 'housing';

export type CommunityResource = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  category: ResourceCategory;
  phone: string;
  hours: string;
};

export const resourceCategories: {
  id: ResourceCategory;
  title: string;
  subtitle: string;
  icon: 'medkit-outline' | 'cafe-outline' | 'happy-outline' | 'home-outline';
}[] = [
  {
    id: 'clinics',
    title: 'Free / Low Cost Resources',
    subtitle: 'Clinics & basics',
    icon: 'medkit-outline',
  },
  {
    id: 'food',
    title: 'Food Pantries',
    subtitle: 'Meals nearby',
    icon: 'cafe-outline',
  },
  {
    id: 'childcare',
    title: 'ChildCare Resources',
    subtitle: 'Care & after-school',
    icon: 'happy-outline',
  },
  {
    id: 'housing',
    title: 'Shelters / Transitional Housing',
    subtitle: 'A place to land',
    icon: 'home-outline',
  },
];

export const resources: CommunityResource[] = [
  {
    id: 'r1',
    name: 'Hackensack Neighborhood Table',
    address: '140 State St, Hackensack, NJ',
    city: 'Hackensack',
    description: 'Weekly grocery bags and a small hot-meal line on weekday afternoons.',
    category: 'food',
    phone: '(201) 555-0142',
    hours: 'Tue–Thu 3–6pm',
  },
  {
    id: 'r2',
    name: 'Paramus Family Pantry',
    address: '33 Midland Ave, Paramus, NJ',
    city: 'Paramus',
    description: 'Packaged foods and baby formula on a walk-in basis while supplies last.',
    category: 'food',
    phone: '(201) 555-0177',
    hours: 'Sat 9am–12pm',
  },
  {
    id: 'r3',
    name: 'Overpeck Community Kitchen',
    address: '8 Outwater Ln, Garfield, NJ',
    city: 'Garfield',
    description: 'Evening meals and a weekend produce share for nearby households.',
    category: 'food',
    phone: '(973) 555-0194',
    hours: 'Mon, Wed, Fri 5–7pm',
  },
  {
    id: 'r4',
    name: 'Cedar Lane Care Circle',
    address: '412 Cedar Ln, Teaneck, NJ',
    city: 'Teaneck',
    description: 'Drop-in childcare during job interviews and weekday morning shifts.',
    category: 'childcare',
    phone: '(201) 555-0136',
    hours: 'Mon–Fri 8am–1pm',
  },
  {
    id: 'r5',
    name: 'Fort Lee After-School Hub',
    address: '201 Main St, Fort Lee, NJ',
    city: 'Fort Lee',
    description: 'After-school desks, snacks, and homework help for elementary ages.',
    category: 'childcare',
    phone: '(201) 555-0188',
    hours: 'Mon–Fri 3–6pm',
  },
  {
    id: 'r6',
    name: 'Hackensack Early Years Room',
    address: '55 Central Ave, Hackensack, NJ',
    city: 'Hackensack',
    description: 'Toddler play hours plus referrals for longer-term childcare slots.',
    category: 'childcare',
    phone: '(201) 555-0119',
    hours: 'Tue–Sat 9am–3pm',
  },
  {
    id: 'r7',
    name: 'River Road Walk-In Clinic',
    address: '70 River St, Hackensack, NJ',
    city: 'Hackensack',
    description: 'Low-cost checkups, vaccines, and help filling out health forms.',
    category: 'clinics',
    phone: '(201) 555-0160',
    hours: 'Mon–Fri 9am–5pm',
  },
  {
    id: 'r8',
    name: 'Teaneck Basics Desk',
    address: '1200 Teaneck Rd, Teaneck, NJ',
    city: 'Teaneck',
    description: 'Transit cards, work clothes closet, and phone-plan paperwork help.',
    category: 'clinics',
    phone: '(201) 555-0124',
    hours: 'Wed–Fri 10am–4pm',
  },
  {
    id: 'r9',
    name: 'Paramus Workwear Exchange',
    address: '9 Century Rd, Paramus, NJ',
    city: 'Paramus',
    description: 'Interview outfits and sturdy shoes for first-week job starts.',
    category: 'clinics',
    phone: '(201) 555-0155',
    hours: 'Thu 4–7pm, Sat 10am–2pm',
  },
  {
    id: 'r10',
    name: 'Overpeck Overnight House',
    address: '22 Passaic St, Garfield, NJ',
    city: 'Garfield',
    description: 'Short-stay beds with lockers and morning transit tokens.',
    category: 'housing',
    phone: '(973) 555-0108',
    hours: 'Intake 6–9pm daily',
  },
  {
    id: 'r11',
    name: 'Bridgeview Transitional Rooms',
    address: '18 Horizon Rd, Fort Lee, NJ',
    city: 'Fort Lee',
    description: 'Shared rooms for up to 90 days while job and housing plans take shape.',
    category: 'housing',
    phone: '(201) 555-0191',
    hours: 'Call ahead, 9am–7pm',
  },
  {
    id: 'r12',
    name: 'Hackensack Stabilization Inn',
    address: '310 State St, Hackensack, NJ',
    city: 'Hackensack',
    description: 'Quiet rooms, case check-ins, and help with first-month rent paperwork.',
    category: 'housing',
    phone: '(201) 555-0170',
    hours: 'Walk-in 8am–8pm',
  },
];

export const categoryCopy: Record<
  ResourceCategory,
  { title: string; icon: 'cafe-outline' | 'happy-outline' | 'medkit-outline' | 'home-outline' }
> = {
  food: { title: 'Food Pantries', icon: 'cafe-outline' },
  childcare: { title: 'ChildCare Resources', icon: 'happy-outline' },
  clinics: { title: 'Free / Low Cost Resources', icon: 'medkit-outline' },
  housing: { title: 'Shelters / Transitional Housing', icon: 'home-outline' },
};
