export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const creators = [
  { name: "Ananya Sharma", handle: "@ananyasharma", role: "Fashion Creator", price: 499, posts: 32, fans: "21.3K" },
  { name: "Rohit Gamer", handle: "@rohitgamer", role: "Gaming Creator", price: 299, posts: 87, fans: "18.7K" },
  { name: "Meera Art", handle: "@meeraart", role: "Digital Artist", price: 399, posts: 56, fans: "16.2K" },
  { name: "Wander With Karan", handle: "@wanderkaran", role: "Travel Creator", price: 499, posts: 45, fans: "15.2K" },
  { name: "Fit With Neha", handle: "@fitneha", role: "Fitness Coach", price: 399, posts: 67, fans: "14.8K" },
];

export const feedPosts = [
  {
    author: "Ananya Sharma",
    role: "Fashion Creator",
    time: "2 hours ago",
    premium: true,
    body: [
      "Morning vibes \u{1F31E}",
      "A little peek into my peaceful Sunday ✨",
      "Full vlog dropping soon for my premium fam! \u{1F49C}",
    ],
    gallery: [
      { seed: "ananya-cup", tag: "5 Photos", kind: "photos" },
      { seed: "ananya-green", kind: "video" },
      { seed: "ananya-beach", tag: "2 Videos", kind: "photos" },
    ],
    likes: "1.2K",
    comments: 128,
    shares: 32,
  },
  {
    author: "Rohit Gamer",
    role: "Gaming Creator",
    time: "4 hours ago",
    premium: true,
    body: [
      "NEW GAMEPLAY ALERT! \u{1F680}",
      "This boss fight was INSANE! \u{1F631}",
      "Exclusive full video for my subscribers only.",
    ],
    hero: { seed: "rohit-stream", duration: "18:45", locked: "Premium Only" },
    likes: "2.3K",
    comments: 245,
    shares: 56,
  },
  {
    author: "Wander With Karan",
    role: "Travel Creator",
    time: "6 hours ago",
    premium: true,
    body: ["Exploring the untouched beauty of Himachal! \u{1F3D4}️"],
    hero: { seed: "karan-himachal" },
    likes: "1.8K",
    comments: 96,
    shares: 41,
  },
];

export const conversations = [
  { name: "Ananya Sharma", time: "2m", last: "Hey! Thanks for the support ❤️", unread: 1, online: true, verified: true },
  { name: "Rohit Gamer", time: "10m", last: "Check out the new video!", unread: 1, online: true, verified: true },
  { name: "Meera Art", time: "30m", last: "Your message was so kind \u{1F64C}", unread: 1, online: true, verified: true },
  { name: "Fitness With Neha", time: "1h", last: "See you in the live session!", online: true, verified: true },
  { name: "Wander With Karan", time: "2h", last: "Loved your question!", verified: true },
  { name: "Creator Squad", time: "3h", last: "Rohit: New upload tomorrow \u{1F525}", unread: 3, group: true },
  { name: "Arjun Fitness", time: "5h", last: "Shared a post" },
  { name: "Pooja Singh", time: "1d", last: "Thank you so much! \u{1F60A}" },
  { name: "Tech With Dev", time: "2d", last: "Let's collab soon" },
];

export const hashtags = [
  { tag: "FitnessMotivation", posts: "12.5K posts" },
  { tag: "TravelDiaries", posts: "8.7K posts" },
  { tag: "GamingLife", posts: "7.2K posts" },
  { tag: "FashionStyle", posts: "6.3K posts" },
  { tag: "CreatorsLife", posts: "5.8K posts" },
];

export const inr = (n) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0 });
