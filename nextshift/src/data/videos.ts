export type PrepVideo = {
  id: string;
  title: string;
  length: string;
  topic: string;
};

export const prepVideos: PrepVideo[] = [
  { id: 'v1', title: 'First-week nerves', length: '4:20', topic: 'Mindset' },
  { id: 'v2', title: 'What to wear', length: '3:05', topic: 'Interview' },
  { id: 'v3', title: 'Talking about gaps', length: '5:12', topic: 'Stories' },
  { id: 'v4', title: 'Asking about pay', length: '4:48', topic: 'Offers' },
];
