export const CATEGORY_OPTIONS = [
  "Fashion",
  "Fitness",
  "Gaming",
  "Food",
  "Music",
  "Travel",
  "Education",
  "Comedy",
  "Art",
  "Technology",
  "Lifestyle",
];

export const FEED_MODES = new Set(["latest", "following", "trending"]);

export const formatInr = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
