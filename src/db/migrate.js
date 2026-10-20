const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:2006@127.0.0.1:5432/app_db'
  });

  await client.connect();
  console.log('Connected to app_db for safe schema expansion...');

  // 1. Users table additions
  await client.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS languages text DEFAULT 'English, Hindi';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS public_email boolean DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS public_location boolean DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS public_skills boolean DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_exchanges boolean DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_milestones boolean DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_reviews boolean DEFAULT true;
  `);

  // Ensure users have usernames derived from email if null
  await client.query(`
    UPDATE users 
    SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'))
    WHERE username IS NULL;
  `);

  // 2. Listings table additions
  await client.query(`
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_url text;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS location text;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS availability text;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS what_provided text;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS what_wanted text;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'active';
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT NOW();
  `);

  // 3. Collaborations table additions
  await client.query(`
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS requester_confirmed boolean DEFAULT false;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS provider_confirmed boolean DEFAULT false;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS requester_commitment text;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS provider_commitment text;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS stage text DEFAULT 'not_started';
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS delivery_required boolean DEFAULT false;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS delivery_method text;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending';
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS delivery_notes text;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS target_date timestamp;
    ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS completed_at timestamp;
  `);

  // 4. Saved Listings (Bookmarks) table
  await client.query(`
    CREATE TABLE IF NOT EXISTS saved_listings (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      created_at timestamp DEFAULT NOW() NOT NULL,
      CONSTRAINT unique_user_saved_listing UNIQUE (user_id, listing_id)
    );
  `);

  // 5. Collaboration Milestones table
  await client.query(`
    CREATE TABLE IF NOT EXISTS collaboration_milestones (
      id serial PRIMARY KEY,
      collaboration_id integer NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      due_date timestamp,
      status text DEFAULT 'not_started' NOT NULL,
      created_by integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamp DEFAULT NOW() NOT NULL
    );
  `);

  // 6. Conversations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id serial PRIMARY KEY,
      participant1_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant2_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id integer REFERENCES listings(id) ON DELETE SET NULL,
      collaboration_id integer REFERENCES collaborations(id) ON DELETE SET NULL,
      last_message text,
      last_message_at timestamp DEFAULT NOW() NOT NULL,
      created_at timestamp DEFAULT NOW() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_conversations_participants 
      ON conversations(participant1_id, participant2_id);
  `);

  // 7. Messages table
  await client.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id serial PRIMARY KEY,
      conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text text NOT NULL,
      is_read boolean DEFAULT false NOT NULL,
      created_at timestamp DEFAULT NOW() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id, created_at);
  `);

  console.log('✅ Safe schema migration executed successfully!');
  await client.end();
}

migrate().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});
