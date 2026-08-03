export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  category: string;
  location?: string;
  bio: string;
  rating: number;
  subscribers: string;
  subscribersCount: number;
  followers: string;
  followersCount: number;
  following: string;
  postsCount: number;
  pricePerMonth: number;
  verified: boolean;
  isLive?: boolean;
  liveViewers?: string;
  trendingRank?: number;
  tier?: 'Platinum' | 'Gold' | 'Silver';
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  isPremium: boolean;
  timeAgo: string;
  content: string;
  mediaType: 'image' | 'gallery' | 'video' | 'audio' | 'poll';
  images?: string[];
  videoDuration?: string;
  videoThumbnail?: string;
  audioDuration?: string;
  pollOptions?: { text: string; votes: number; percentage: number }[];
  totalVotes?: number;
  likes: string;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  pinned?: boolean;
}

export interface Transaction {
  id: string;
  type: 'Subscription - VIP' | 'Tip' | 'Paid Message' | 'Live Stream' | 'Subscription - Monthly';
  from: string;
  date: string;
  time: string;
  amount: string;
  amountNumber: number;
  status: 'Completed' | 'Pending';
  iconType: 'vip' | 'tip' | 'message' | 'stream' | 'sub';
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text?: string;
  audioDuration?: string;
  timestamp: string;
  isMe: boolean;
  isRead: boolean;
  media?: string[];
}

export interface ChatContact {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  category: string;
  posts: number;
  followers: string;
  following: number;
}

export interface CommunityThread {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorRole?: string;
  timeAgo: string;
  title?: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  isPinned?: boolean;
  pollOptions?: { text: string; percentage: number }[];
  totalVotes?: number;
  images?: string[];
  eventPromo?: { title: string; date: string; time: string; host: string };
}

// Sample Image URLs using high quality Unsplash portraits
export const SAMPLE_IMAGES = {
  ananya: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  ananyaCover: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  rohit: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  meera: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  karan: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  neha: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  arjun: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  sangeetika: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  nehaVerma: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  riya: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  kavya: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  
  // Post & Content Media
  post1: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  post2: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
  post3: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&w=800&q=80',
  gamingSetup: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  artStudio: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  travelBeach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  fitnessGym: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
};

export const CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Ananya Sharma',
    handle: '@ananyasharma',
    avatar: SAMPLE_IMAGES.ananya,
    coverImage: SAMPLE_IMAGES.ananyaCover,
    category: 'Fashion Creator 👗',
    location: 'Mumbai, India 📍',
    bio: 'Creating fashion, lifestyle & travel content that inspires ✨ Exclusive content for my amazing fam! 💜',
    rating: 5.0,
    subscribers: '4.8K',
    subscribersCount: 4800,
    followers: '21.3K',
    followersCount: 21300,
    following: '98',
    postsCount: 124,
    pricePerMonth: 499,
    verified: true,
    isLive: true,
    liveViewers: '1.2K',
    trendingRank: 1,
    tier: 'Platinum'
  },
  {
    id: 'c2',
    name: 'Rohit Gamer',
    handle: '@rohitgamer',
    avatar: SAMPLE_IMAGES.rohit,
    category: 'Gaming Creator',
    bio: 'Pro streamer, esports enthusiast & setup builder 🎮 Daily live streams & exclusive gameplay tips!',
    rating: 4.9,
    subscribers: '8.7K',
    subscribersCount: 8700,
    followers: '18.7K',
    followersCount: 18700,
    following: '112',
    postsCount: 87,
    pricePerMonth: 299,
    verified: true,
    isLive: true,
    liveViewers: '890',
    trendingRank: 2,
    tier: 'Platinum'
  },
  {
    id: 'c3',
    name: 'Meera Art',
    handle: '@meeraart',
    avatar: SAMPLE_IMAGES.meera,
    category: 'Digital Artist 🎨',
    bio: 'Digital illustrator & 3D conceptual artist. Unlocking brushes, process videos & PSD files!',
    rating: 4.9,
    subscribers: '5.6K',
    subscribersCount: 5600,
    followers: '55.1K',
    followersCount: 55100,
    following: '45',
    postsCount: 56,
    pricePerMonth: 399,
    verified: true,
    isLive: true,
    liveViewers: '567',
    trendingRank: 3,
    tier: 'Platinum'
  },
  {
    id: 'c4',
    name: 'Wander With Karan',
    handle: '@wanderwithkaran',
    avatar: SAMPLE_IMAGES.karan,
    category: 'Travel Vlogger 🧳',
    bio: 'Exploring untouched destinations across the world ⛰️ Travel guides, budget hacks & raw vlogs!',
    rating: 4.8,
    subscribers: '4.5K',
    subscribersCount: 4500,
    followers: '15.2K',
    followersCount: 15200,
    following: '140',
    postsCount: 45,
    pricePerMonth: 499,
    verified: true,
    isLive: true,
    liveViewers: '450',
    trendingRank: 4,
    tier: 'Gold'
  },
  {
    id: 'c5',
    name: 'Fit With Neha',
    handle: '@fitwithneha',
    avatar: SAMPLE_IMAGES.neha,
    category: 'Fitness Coach 🏋️‍♀️',
    bio: 'Transform your body & mind 💪 Customized meal plans, workout routines & weekly Q&A calls!',
    rating: 4.9,
    subscribers: '6.7K',
    subscribersCount: 6700,
    followers: '14.8K',
    followersCount: 14800,
    following: '62',
    postsCount: 67,
    pricePerMonth: 399,
    verified: true,
    isLive: true,
    liveViewers: '320',
    tier: 'Gold'
  },
  {
    id: 'c6',
    name: 'Arjun Fitness',
    handle: '@arjunfitness',
    avatar: SAMPLE_IMAGES.arjun,
    category: 'Fitness Coach 🏋️‍♂️',
    bio: 'Calisthenics & strength training specialist. Daily routine guides!',
    rating: 4.8,
    subscribers: '3.2K',
    subscribersCount: 3200,
    followers: '18.7K',
    followersCount: 18700,
    following: '50',
    postsCount: 92,
    pricePerMonth: 299,
    verified: true
  },
  {
    id: 'c7',
    name: 'Sangeetika',
    handle: '@sangeetika',
    avatar: SAMPLE_IMAGES.sangeetika,
    category: 'Singer 🎤',
    bio: 'Independent musician & vocalist. Original songs, covers & raw studio sessions!',
    rating: 4.9,
    subscribers: '2.9K',
    subscribersCount: 2900,
    followers: '14.8K',
    followersCount: 14800,
    following: '88',
    postsCount: 41,
    pricePerMonth: 199,
    verified: true
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'c1',
    authorName: 'Ananya Sharma',
    authorAvatar: SAMPLE_IMAGES.ananya,
    authorVerified: true,
    isPremium: true,
    timeAgo: '2 hours ago',
    content: 'Morning vibes ☀️ A little peek into my peaceful Sunday ✨ Full vlog dropping soon for my premium fam! 💜',
    mediaType: 'gallery',
    images: [SAMPLE_IMAGES.post1, SAMPLE_IMAGES.post2, SAMPLE_IMAGES.post3],
    likes: '1.2K',
    comments: 128,
    shares: 32,
    isLiked: true,
    isSaved: true
  },
  {
    id: 'p2',
    authorId: 'c2',
    authorName: 'Rohit Gamer',
    authorAvatar: SAMPLE_IMAGES.rohit,
    authorVerified: true,
    isPremium: true,
    timeAgo: '4 hours ago',
    content: 'NEW GAMEPLAY ALERT! 🚀 This boss fight was INSANE! 😱 Exclusive full video for my subscribers only.',
    mediaType: 'video',
    videoThumbnail: SAMPLE_IMAGES.gamingSetup,
    videoDuration: '18:45',
    likes: '2.3K',
    comments: 245,
    shares: 56,
    isLiked: false
  },
  {
    id: 'p3',
    authorId: 'c4',
    authorName: 'Wander With Karan',
    authorAvatar: SAMPLE_IMAGES.karan,
    authorVerified: true,
    isPremium: false,
    timeAgo: '6 hours ago',
    content: 'Exploring the untouched beauty of Himachal! 🏔️ Here is a breakdown of secret spots you must visit on your next trip.',
    mediaType: 'image',
    images: [SAMPLE_IMAGES.travelBeach],
    likes: '950',
    comments: 64,
    shares: 18
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'Subscription - VIP',
    from: 'Rohan Mehta',
    date: '28 May 2024',
    time: '10:30 AM',
    amount: '₹499.00',
    amountNumber: 499,
    status: 'Completed',
    iconType: 'vip'
  },
  {
    id: 't2',
    type: 'Tip',
    from: 'Neha Verma',
    date: '28 May 2024',
    time: '09:15 AM',
    amount: '₹1,000.00',
    amountNumber: 1000,
    status: 'Completed',
    iconType: 'tip'
  },
  {
    id: 't3',
    type: 'Paid Message',
    from: 'Arjun Singh',
    date: '28 May 2024',
    time: '08:45 AM',
    amount: '₹250.00',
    amountNumber: 250,
    status: 'Completed',
    iconType: 'message'
  },
  {
    id: 't4',
    type: 'Live Stream',
    from: 'May 27, 2024',
    date: '27 May 2024',
    time: '11:30 PM',
    amount: '₹2,840.00',
    amountNumber: 2840,
    status: 'Completed',
    iconType: 'stream'
  },
  {
    id: 't5',
    type: 'Subscription - Monthly',
    from: 'Priya Patel',
    date: '27 May 2024',
    time: '10:10 PM',
    amount: '₹299.00',
    amountNumber: 299,
    status: 'Completed',
    iconType: 'sub'
  }
];

export const CHAT_CONTACTS: ChatContact[] = [
  {
    id: 'ch1',
    name: 'Ananya Sharma',
    handle: '@ananyasharma',
    avatar: SAMPLE_IMAGES.ananya,
    verified: true,
    online: true,
    lastMessage: 'Hey! Thanks for the support ❤️',
    lastTime: '2m',
    unreadCount: 1,
    category: 'Fashion Creator 👗',
    posts: 124,
    followers: '21.3K',
    following: 98
  },
  {
    id: 'ch2',
    name: 'Rohit Gamer',
    handle: '@rohitgamer',
    avatar: SAMPLE_IMAGES.rohit,
    verified: true,
    online: true,
    lastMessage: 'Check out the new video!',
    lastTime: '10m',
    unreadCount: 1,
    category: 'Gaming Creator 🎮',
    posts: 87,
    followers: '18.7K',
    following: 112
  },
  {
    id: 'ch3',
    name: 'Meera Art',
    handle: '@meeraart',
    avatar: SAMPLE_IMAGES.meera,
    verified: true,
    online: false,
    lastMessage: 'Your message was so kind 🙌',
    lastTime: '30m',
    unreadCount: 1,
    category: 'Digital Artist 🎨',
    posts: 56,
    followers: '55.1K',
    following: 45
  },
  {
    id: 'ch4',
    name: 'Fitness With Neha',
    handle: '@fitwithneha',
    avatar: SAMPLE_IMAGES.neha,
    verified: true,
    online: true,
    lastMessage: 'See you in the live session!',
    lastTime: '1h',
    unreadCount: 0,
    category: 'Fitness Coach',
    posts: 67,
    followers: '14.8K',
    following: 62
  },
  {
    id: 'ch5',
    name: 'Wander With Karan',
    handle: '@wanderwithkaran',
    avatar: SAMPLE_IMAGES.karan,
    verified: true,
    online: false,
    lastMessage: 'Loved your question!',
    lastTime: '2h',
    unreadCount: 0,
    category: 'Travel Vlogger',
    posts: 45,
    followers: '15.2K',
    following: 140
  }
];

export const DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'm1',
    senderId: 'c1',
    text: 'Hey Arjun! 👋 Just wanted to say a big THANK YOU ❤️ Your support means a lot to me!',
    timestamp: '10:30 AM',
    isMe: false,
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'user',
    text: 'Hey Ananya! 😊 You\'re doing amazing work. Keep inspiring! 🔥',
    timestamp: '10:32 AM',
    isMe: true,
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'c1',
    audioDuration: '0:15',
    timestamp: '10:33 AM',
    isMe: false,
    isRead: true
  },
  {
    id: 'm4',
    senderId: 'user',
    text: 'Can\'t wait for your next live session! 🚀',
    timestamp: '10:34 AM',
    isMe: true,
    isRead: true
  },
  {
    id: 'm5',
    senderId: 'c1',
    text: 'I\'m going live tomorrow at 8 PM. Hope to see you there! 🎥✨',
    timestamp: '10:35 AM',
    isMe: false,
    isRead: false
  }
];

export const COMMUNITY_THREADS: CommunityThread[] = [
  {
    id: 'ct1',
    authorName: 'Ananya Sharma',
    authorHandle: '@ananyasharma',
    authorAvatar: SAMPLE_IMAGES.ananya,
    authorRole: 'Creator Account',
    timeAgo: '2 days ago',
    title: 'Welcome to the Crevora Creator Community! 🎉',
    content: 'This is our space to support, collaborate and grow together. Feel free to introduce yourself and share your journey!',
    tags: ['announcement', 'welcome'],
    likes: 128,
    comments: 56,
    isPinned: true
  },
  {
    id: 'ct2',
    authorName: 'Neha Verma',
    authorHandle: '@nehaverma',
    authorAvatar: SAMPLE_IMAGES.nehaVerma,
    authorRole: 'Top Creator',
    timeAgo: '1h ago',
    content: 'Just finished my new photoshoot! 📸 Behind the scenes will be up on my exclusive soon. What type of content do you guys love the most?',
    tags: ['photoshoot', 'bts', 'content'],
    likes: 45,
    comments: 32,
    images: [SAMPLE_IMAGES.post1, SAMPLE_IMAGES.post2, SAMPLE_IMAGES.post3]
  },
  {
    id: 'ct3',
    authorName: 'Riya Malhotra',
    authorHandle: '@riyamalhotra',
    authorAvatar: SAMPLE_IMAGES.riya,
    timeAgo: '3h ago',
    content: 'Let\'s talk about creator burnout. How do you stay consistent and take care of your mental health?',
    tags: ['wellness'],
    likes: 38,
    comments: 27,
    pollOptions: [
      { text: 'Take Breaks', percentage: 60 },
      { text: 'Plan & Schedule', percentage: 25 },
      { text: 'Meditation / Exercise', percentage: 15 }
    ],
    totalVotes: 120
  },
  {
    id: 'ct4',
    authorName: 'Ananya Sharma',
    authorHandle: '@ananyasharma',
    authorAvatar: SAMPLE_IMAGES.ananya,
    authorRole: 'Creator',
    timeAgo: '1d ago',
    content: 'We\'re going LIVE this Saturday at 7 PM IST 🎥 Topic: How I plan my content & stay productive. Don\'t miss it!',
    tags: ['livesession'],
    likes: 89,
    comments: 61,
    eventPromo: {
      title: 'How I plan my content & stay productive',
      date: '25 May, 7:00 PM IST',
      time: '7:00 PM',
      host: 'Ananya Sharma'
    }
  }
];
