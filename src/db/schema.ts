import { pgTable, serial, text, timestamp, integer, real, boolean, pgEnum, unique } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);
export const listingTypeEnum = pgEnum("listing_type", ["offer", "need"]);
export const listingStatusEnum = pgEnum("listing_status", ["active", "closed"]);
export const collabStatusEnum = pgEnum("collab_status", ["pending", "accepted", "declined", "completed"]);
export const listingKindEnum = pgEnum("listing_kind", ["skill", "service", "resource"]);
export const exchangeTypeEnum = pgEnum("exchange_type", ["barter", "free", "paid"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  business: text("business").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  role: roleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ratingAvg: real("rating_avg").default(0).notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Extended Profile & Settings fields
  username: text("username").unique(),
  bio: text("bio"),
  occupation: text("occupation"),
  languages: text("languages").default("English, Hindi"),
  skills: text("skills"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  publicEmail: boolean("public_email").default(false),
  publicLocation: boolean("public_location").default(true),
  publicSkills: boolean("public_skills").default(true),
  preferredLanguage: text("preferred_language").default("en"),
  theme: text("theme").default("light"),
  notifyMessages: boolean("notify_messages").default(true),
  notifyExchanges: boolean("notify_exchanges").default(true),
  notifyMilestones: boolean("notify_milestones").default(true),
  notifyReviews: boolean("notify_reviews").default(true),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: listingTypeEnum("type").notNull(),
  kind: listingKindEnum("kind").default("skill").notNull(),
  exchangeType: exchangeTypeEnum("exchange_type").default("barter").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags"),
  status: listingStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Extended Listing fields
  imageUrl: text("image_url"),
  location: text("location"),
  availability: text("availability"),
  whatProvided: text("what_provided"),
  whatWanted: text("what_wanted"),
  lifecycleStatus: text("lifecycle_status").default("active"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  message: text("message"),
  status: collabStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Extended Resource Exchange & Collaboration workflow fields
  requesterConfirmed: boolean("requester_confirmed").default(false),
  providerConfirmed: boolean("provider_confirmed").default(false),
  requesterCommitment: text("requester_commitment"),
  providerCommitment: text("provider_commitment"),
  progress: integer("progress").default(0),
  stage: text("stage").default("not_started"), // not_started, in_progress, ready_for_confirmation, completed, cancelled
  deliveryRequired: boolean("delivery_required").default(false),
  deliveryMethod: text("delivery_method"), // pickup, handover, courier, remote
  deliveryStatus: text("delivery_status").default("pending"), // pending, dispatched, received
  deliveryNotes: text("delivery_notes"),
  targetDate: timestamp("target_date"),
  completedAt: timestamp("completed_at"),
});

export const collaborationMilestones = pgTable("collaboration_milestones", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id")
    .notNull()
    .references(() => collaborations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").default("not_started").notNull(), // not_started, in_progress, completed
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id")
    .notNull()
    .references(() => collaborations.id, { onDelete: "cascade" }),
  reviewerId: integer("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  revieweeId: integer("reviewee_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedListings = pgTable("saved_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participant1Id: integer("participant1_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  participant2Id: integer("participant2_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
  collaborationId: integer("collaboration_id").references(() => collaborations.id, { onDelete: "set null" }),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
