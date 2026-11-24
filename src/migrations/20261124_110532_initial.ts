import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'committee_editor' NOT NULL,
  	\`totp_secret\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`events_recurring_days_of_week\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`events_recurring_days_of_week_order_idx\` ON \`events_recurring_days_of_week\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`events_recurring_days_of_week_parent_idx\` ON \`events_recurring_days_of_week\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`events_rooms\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`events_rooms_order_idx\` ON \`events_rooms\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`events_rooms_parent_idx\` ON \`events_rooms\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`status\` text DEFAULT 'published',
  	\`category\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`all_day\` integer DEFAULT false,
  	\`location_venue_name\` text,
  	\`location_address\` text,
  	\`location_map_url\` text,
  	\`description\` text,
  	\`featured_image_id\` integer,
  	\`recurrence\` text DEFAULT 'none',
  	\`recurring_enabled\` integer DEFAULT false,
  	\`recurring_frequency\` text DEFAULT 'weekly',
  	\`recurring_interval\` numeric DEFAULT 1,
  	\`recurring_until\` text,
  	\`registration_url\` text,
  	\`payment_url\` text,
  	\`age_groups\` text,
  	\`restrictions\` text,
  	\`logistics_food_required\` integer DEFAULT false,
  	\`logistics_stage_required\` integer DEFAULT false,
  	\`logistics_sound_system_required\` integer DEFAULT false,
  	\`logistics_external_venue\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`events_slug_idx\` ON \`events\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`events_featured_image_idx\` ON \`events\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`events__status_idx\` ON \`events\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_events_v_version_recurring_days_of_week\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_events_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_events_v_version_recurring_days_of_week_order_idx\` ON \`_events_v_version_recurring_days_of_week\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_recurring_days_of_week_parent_idx\` ON \`_events_v_version_recurring_days_of_week\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_events_v_version_rooms\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_events_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_events_v_version_rooms_order_idx\` ON \`_events_v_version_rooms\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_rooms_parent_idx\` ON \`_events_v_version_rooms\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_events_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_status\` text DEFAULT 'published',
  	\`version_category\` text,
  	\`version_start_date\` text,
  	\`version_end_date\` text,
  	\`version_all_day\` integer DEFAULT false,
  	\`version_location_venue_name\` text,
  	\`version_location_address\` text,
  	\`version_location_map_url\` text,
  	\`version_description\` text,
  	\`version_featured_image_id\` integer,
  	\`version_recurrence\` text DEFAULT 'none',
  	\`version_recurring_enabled\` integer DEFAULT false,
  	\`version_recurring_frequency\` text DEFAULT 'weekly',
  	\`version_recurring_interval\` numeric DEFAULT 1,
  	\`version_recurring_until\` text,
  	\`version_registration_url\` text,
  	\`version_payment_url\` text,
  	\`version_age_groups\` text,
  	\`version_restrictions\` text,
  	\`version_logistics_food_required\` integer DEFAULT false,
  	\`version_logistics_stage_required\` integer DEFAULT false,
  	\`version_logistics_sound_system_required\` integer DEFAULT false,
  	\`version_logistics_external_venue\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_events_v_parent_idx\` ON \`_events_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_slug_idx\` ON \`_events_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_featured_image_idx\` ON \`_events_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_updated_at_idx\` ON \`_events_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_created_at_idx\` ON \`_events_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version__status_idx\` ON \`_events_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_created_at_idx\` ON \`_events_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_updated_at_idx\` ON \`_events_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_latest_idx\` ON \`_events_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_autosave_idx\` ON \`_events_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`announcements\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`display_in_carousel\` integer DEFAULT false,
  	\`body\` text,
  	\`published_at\` text,
  	\`expires_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`announcements_updated_at_idx\` ON \`announcements\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`announcements_created_at_idx\` ON \`announcements\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`announcements__status_idx\` ON \`announcements\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_announcements_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_display_in_carousel\` integer DEFAULT false,
  	\`version_body\` text,
  	\`version_published_at\` text,
  	\`version_expires_at\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`announcements\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_announcements_v_parent_idx\` ON \`_announcements_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_version_version_updated_at_idx\` ON \`_announcements_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_version_version_created_at_idx\` ON \`_announcements_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_version_version__status_idx\` ON \`_announcements_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_created_at_idx\` ON \`_announcements_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_updated_at_idx\` ON \`_announcements_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_latest_idx\` ON \`_announcements_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_announcements_v_autosave_idx\` ON \`_announcements_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`image_upload_links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`token_hash\` text NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`alt\` text,
  	\`event_id\` integer,
  	\`created_by_id\` integer,
  	\`used_at\` text,
  	\`media_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`image_upload_links_token_hash_idx\` ON \`image_upload_links\` (\`token_hash\`);`)
  await db.run(sql`CREATE INDEX \`image_upload_links_event_idx\` ON \`image_upload_links\` (\`event_id\`);`)
  await db.run(sql`CREATE INDEX \`image_upload_links_created_by_idx\` ON \`image_upload_links\` (\`created_by_id\`);`)
  await db.run(sql`CREATE INDEX \`image_upload_links_media_idx\` ON \`image_upload_links\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`image_upload_links_updated_at_idx\` ON \`image_upload_links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`image_upload_links_created_at_idx\` ON \`image_upload_links\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`totp_attempts\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`attempts\` numeric DEFAULT 0 NOT NULL,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`events_find\` integer DEFAULT false,
  	\`events_create\` integer DEFAULT false,
  	\`events_update\` integer DEFAULT false,
  	\`events_delete\` integer DEFAULT false,
  	\`announcements_find\` integer DEFAULT false,
  	\`announcements_create\` integer DEFAULT false,
  	\`announcements_update\` integer DEFAULT false,
  	\`announcements_delete\` integer DEFAULT false,
  	\`pages_find\` integer DEFAULT false,
  	\`pages_create\` integer DEFAULT false,
  	\`pages_update\` integer DEFAULT false,
  	\`media_find\` integer DEFAULT false,
  	\`jumuah_times_find\` integer DEFAULT false,
  	\`jumuah_times_update\` integer DEFAULT false,
  	\`site_settings_find\` integer DEFAULT false,
  	\`site_settings_update\` integer DEFAULT false,
  	\`madrasah_find\` integer DEFAULT false,
  	\`madrasah_update\` integer DEFAULT false,
  	\`payload_mcp_tool_upload_image_from_url\` integer DEFAULT true,
  	\`payload_mcp_tool_create_image_upload_link\` integer DEFAULT true,
  	\`payload_mcp_tool_check_image_upload_link\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`events_id\` integer,
  	\`announcements_id\` integer,
  	\`pages_id\` integer,
  	\`image_upload_links_id\` integer,
  	\`payload_mcp_api_keys_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`announcements_id\`) REFERENCES \`announcements\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`image_upload_links_id\`) REFERENCES \`image_upload_links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_mcp_api_keys_id\`) REFERENCES \`payload_mcp_api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_announcements_id_idx\` ON \`payload_locked_documents_rels\` (\`announcements_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_image_upload_links_id_idx\` ON \`payload_locked_documents_rels\` (\`image_upload_links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`payload_mcp_api_keys_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_mcp_api_keys_id\`) REFERENCES \`payload_mcp_api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_donation_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`description\` text,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_donation_links_order_idx\` ON \`site_settings_donation_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_donation_links_parent_id_idx\` ON \`site_settings_donation_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_bank_accounts_details\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_bank_accounts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_bank_accounts_details_order_idx\` ON \`site_settings_bank_accounts_details\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_bank_accounts_details_parent_id_idx\` ON \`site_settings_bank_accounts_details\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_bank_accounts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_bank_accounts_order_idx\` ON \`site_settings_bank_accounts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_bank_accounts_parent_id_idx\` ON \`site_settings_bank_accounts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_contacts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`kind\` text DEFAULT 'email' NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_contacts_order_idx\` ON \`site_settings_contacts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_contacts_parent_id_idx\` ON \`site_settings_contacts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'mosque' NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_services_order_idx\` ON \`site_settings_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_services_parent_id_idx\` ON \`site_settings_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`mosque_name\` text DEFAULT 'Example Masjid' NOT NULL,
  	\`short_name\` text,
  	\`tagline\` text,
  	\`address\` text,
  	\`phone\` text,
  	\`email\` text,
  	\`mawaqit_mosque_slug\` text,
  	\`social_facebook\` text,
  	\`social_instagram\` text,
  	\`social_youtube\` text,
  	\`social_twitter\` text,
  	\`youtube_channel_id\` text,
  	\`donate_intro\` text,
  	\`charity_number\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`jumuah_times_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`jamaat_time\` text NOT NULL,
  	\`khutbah_time\` text,
  	\`location\` text,
  	\`postcode\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`jumuah_times\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`jumuah_times_sessions_order_idx\` ON \`jumuah_times_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`jumuah_times_sessions_parent_id_idx\` ON \`jumuah_times_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`jumuah_times\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`note\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`madrasah_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`days\` text,
  	\`times\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`madrasah\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_sessions_order_idx\` ON \`madrasah_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_sessions_parent_id_idx\` ON \`madrasah_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`madrasah_subjects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`madrasah\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_subjects_order_idx\` ON \`madrasah_subjects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_subjects_parent_id_idx\` ON \`madrasah_subjects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`madrasah_future_programmes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`madrasah\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_future_programmes_order_idx\` ON \`madrasah_future_programmes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_future_programmes_parent_id_idx\` ON \`madrasah_future_programmes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`madrasah_portal_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`arabic_label\` text,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`madrasah\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_portal_links_order_idx\` ON \`madrasah_portal_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_portal_links_parent_id_idx\` ON \`madrasah_portal_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`madrasah_newsletters\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`issue_date\` text,
  	\`file_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`madrasah\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_newsletters_order_idx\` ON \`madrasah_newsletters\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_newsletters_parent_id_idx\` ON \`madrasah_newsletters\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_newsletters_file_idx\` ON \`madrasah_newsletters\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`madrasah\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Madrasah',
  	\`logo_id\` integer,
  	\`intro\` text NOT NULL,
  	\`apply_url\` text,
  	\`contact_email\` text,
  	\`curriculum_text\` text,
  	\`curriculum_url\` text,
  	\`vision\` text,
  	\`future_programmes_note\` text,
  	\`teachers_intro\` text,
  	\`headteacher_name\` text,
  	\`headteacher_role\` text,
  	\`headteacher_bio\` text,
  	\`headteacher_photo_id\` integer,
  	\`newsletter_intro\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`headteacher_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`madrasah_logo_idx\` ON \`madrasah\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`madrasah_headteacher_headteacher_photo_idx\` ON \`madrasah\` (\`headteacher_photo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`events_recurring_days_of_week\`;`)
  await db.run(sql`DROP TABLE \`events_rooms\`;`)
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`DROP TABLE \`_events_v_version_recurring_days_of_week\`;`)
  await db.run(sql`DROP TABLE \`_events_v_version_rooms\`;`)
  await db.run(sql`DROP TABLE \`_events_v\`;`)
  await db.run(sql`DROP TABLE \`announcements\`;`)
  await db.run(sql`DROP TABLE \`_announcements_v\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`image_upload_links\`;`)
  await db.run(sql`DROP TABLE \`totp_attempts\`;`)
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_donation_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_bank_accounts_details\`;`)
  await db.run(sql`DROP TABLE \`site_settings_bank_accounts\`;`)
  await db.run(sql`DROP TABLE \`site_settings_contacts\`;`)
  await db.run(sql`DROP TABLE \`site_settings_services\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`jumuah_times_sessions\`;`)
  await db.run(sql`DROP TABLE \`jumuah_times\`;`)
  await db.run(sql`DROP TABLE \`madrasah_sessions\`;`)
  await db.run(sql`DROP TABLE \`madrasah_subjects\`;`)
  await db.run(sql`DROP TABLE \`madrasah_future_programmes\`;`)
  await db.run(sql`DROP TABLE \`madrasah_portal_links\`;`)
  await db.run(sql`DROP TABLE \`madrasah_newsletters\`;`)
  await db.run(sql`DROP TABLE \`madrasah\`;`)
}
