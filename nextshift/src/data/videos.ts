export type PrepVideo = {
  id: string;
  title: string;
  length: string;
  topic: string;
  url: string;
  youtubeId: string;
};

export const prepVideos: PrepVideo[] = [
  {
    id: 'v1',
    title: 'First-week nerves',
    length: '4:20',
    topic: 'Mindset',
    url: 'https://www.youtube.com/watch?v=Wvq1BhvUubg',
    youtubeId: 'Wvq1BhvUubg',
  },
  {
    id: 'v2',
    title: 'What to wear',
    length: '3:05',
    topic: 'Interview',
    url: 'https://www.youtube.com/watch?v=jzPAjrrtLxY',
    youtubeId: 'jzPAjrrtLxY',
  },
  {
    id: 'v3',
    title: 'Talking about gaps',
    length: '5:12',
    topic: 'Stories',
    url: 'https://www.youtube.com/watch?v=KlIUWGrCcqU',
    youtubeId: 'KlIUWGrCcqU',
  },
  {
    id: 'v4',
    title: 'Asking about pay',
    length: '4:48',
    topic: 'Offers',
    url: 'https://www.youtube.com/watch?v=Qhr7Cy7YLrM',
    youtubeId: 'Qhr7Cy7YLrM',
  },
];
