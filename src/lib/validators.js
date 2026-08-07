import { z } from "zod";
import { FEED_MODES } from "./consumer/constants";

// ─── Auth Schemas ───────────────────────────────────────────────────────────

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Handle must be at least 3 characters")
  .max(30, "Handle must be at most 30 characters")
  .regex(
    /^[a-z0-9_]+$/,
    "Handle can only contain letters, numbers, and underscores"
  );

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .trim()
    .toLowerCase(),
  password: passwordSchema,
  handle: handleSchema,
  role: z.enum(["USER", "CREATOR"], {
    errorMap: () => ({ message: "Role must be USER or CREATOR" }),
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
  role: z.enum(["USER", "CREATOR"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email("Invalid email address").max(255)),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(512),
  password: passwordSchema,
}).strict();

// ─── Post Schemas ───────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be at most 5000 characters")
    .trim(),
  mediaUrl: z.string().url().nullable().optional(),
  mediaType: z.enum(["image", "video", "audio", "document"]).nullable().optional(),
  isPremium: z.boolean().optional().default(false),
  price: z.number().min(0).optional().default(0),
});

export const socialPostCreateSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be at most 5000 characters")
    .trim(),
  mediaAssetId: z.string().uuid().optional(),
  category: z.enum([
    "Fashion", "Fitness", "Sports", "Gaming", "Food", "Music",
    "Travel", "Education", "Comedy", "Art", "Technology", "Lifestyle",
  ]).optional().default("Lifestyle"),
}).strict();

export const socialPostUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be at most 5000 characters")
    .trim(),
}).strict();

// ─── Comment Schemas ────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be at most 2000 characters")
    .trim(),
  parentId: z.string().uuid().nullable().optional(),
});

export const feedQuerySchema = z.object({
  mode: z.enum([...FEED_MODES]),
  limit: z.coerce.number().int().min(1).max(30),
  cursor: z.string().min(1).nullable(),
});

// ─── Message Schemas ────────────────────────────────────────────────────────

export const databaseIdSchema = z
  .string()
  .min(1, "Database ID is required")
  .max(191, "Database ID is too long")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid database ID");

export const sendMessageSchema = z.object({
  receiverId: databaseIdSchema.optional(),
  conversationId: z.string().uuid("Invalid conversation ID").optional(),
  content: z.string().max(5000).nullable().optional(),
  isAudio: z.boolean().optional().default(false),
  duration: z.string().nullable().optional(),
  mediaUrl: z.string().url().nullable().optional(),
});

// ─── Subscription Schemas ───────────────────────────────────────────────────

export const createSubscriptionSchema = z.object({
  creatorId: z.string().uuid("Invalid creator ID"),
  tier: z.string().min(1, "Tier is required"),
  price: z.number().positive("Price must be positive"),
  method: z.string().optional().default("Wallet Balance"),
});

// ─── Collection Schemas ─────────────────────────────────────────────────────

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be at most 100 characters")
    .trim(),
  description: z.string().max(500).nullable().optional(),
});

// ─── Wallet Schemas ─────────────────────────────────────────────────────────

export const depositSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000, "Maximum deposit is ₹1,00,000"),
  method: z.string().optional().default("UPI"),
  reference: z.string().optional(),
});

// ─── Search Schema ──────────────────────────────────────────────────────────

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200).trim(),
  type: z.enum(["all", "creators", "posts", "communities", "videos"]).optional().default("all"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

// ─── Profile Update Schema ─────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  handle: handleSchema.optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  roleTitle: z.string().max(50).nullable().optional(),
  location: z.string().max(80).nullable().optional(),
  address: z.string().trim().max(240).transform((value) => value || null).nullable().optional(),
  phone: z.string().trim().max(20).refine(
    (value) => !value || /^\+?[0-9][0-9\s-]{7,18}$/.test(value),
    "Enter a valid phone number",
  ).transform((value) => value || null).nullable().optional(),
  website: z.string().url().max(2048).nullable().optional(),
  profileVisibility: z.enum(["PUBLIC", "FOLLOWERS"]).optional(),
}).strict();

export const creatorSettingsSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  bio: z.string().max(500).trim().transform((value) => value || null),
  category: z.enum([
    "Fashion", "Fitness", "Sports", "Gaming", "Food", "Music",
    "Travel", "Education", "Comedy", "Art", "Technology", "Lifestyle",
  ]),
  subscriptionPrice: z.number().int().min(0).max(100000),
  payoutMethod: z.enum(["BANK_TRANSFER", "UPI"]).nullable().optional(),
  payoutDetails: z.string().trim().max(120).transform((value) => value || null).nullable().optional(),
}).strict();

export const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment must be at most 2000 characters").trim(),
}).strict();

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
}).strict();

export const uploadSignSchema = z.object({
  fileName: z.string().min(1).max(120),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"]),
  bytes: z.number().int().positive().max(2 * 1024 * 1024 * 1024),
  width: z.number().int().positive().max(2147483647).optional(),
  height: z.number().int().positive().max(2147483647).optional(),
  kind: z.enum(["avatar", "cover", "post"]),
}).strict().superRefine((value, context) => {
  if (value.mimeType.startsWith("image/") && value.bytes > 4 * 1024 * 1024) {
    context.addIssue({ code: "custom", path: ["bytes"], message: "Image must be 4 MiB or smaller" });
  }
  if (value.mimeType.startsWith("image/") && (!value.width || !value.height)) {
    context.addIssue({ code: "custom", path: ["width"], message: "Image dimensions are required" });
  }
  if (value.mimeType.startsWith("video/") && value.kind !== "post") {
    context.addIssue({ code: "custom", path: ["kind"], message: "Videos can only be uploaded to posts" });
  }
});

export const uploadCompleteSchema = z.object({
  assetId: z.string().uuid(),
}).strict();

// ─── Community Schemas ──────────────────────────────────────────────────────

export const createCommunitySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(1000).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  isPrivate: z.boolean().optional().default(false),
});

export const communityPostSchema = z.object({
  content: z.string().min(1).max(5000).trim(),
  mediaUrl: z.string().url().nullable().optional(),
  isPinned: z.boolean().optional().default(false),
});

// ─── Report Schema ──────────────────────────────────────────────────────────

export const reportSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(["POST", "COMMENT", "USER", "COMMUNITY", "MESSAGE"]),
  reason: z.enum([
    "SPAM",
    "HARASSMENT",
    "HATE_SPEECH",
    "NUDITY",
    "VIOLENCE",
    "MISINFORMATION",
    "COPYRIGHT",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
});

// ─── Withdrawal Schema ─────────────────────────────────────────────────────

export const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["BANK_TRANSFER", "UPI", "PAYPAL"]),
  accountDetails: z.string().min(1, "Account details required"),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate request body against a Zod schema.
 * Returns { data } on success or { error } on failure.
 */
export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return { error: errors };
  }
  return { data: result.data };
}
