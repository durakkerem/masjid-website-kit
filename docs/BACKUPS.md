# Backups

All of the site's content lives in two places on the server:

- the database file, `masjid.db` (events, pages, settings, users, keys);
- the `media/` folder (uploaded images and PDFs);

plus your `.env` file (keep a copy of its `PAYLOAD_SECRET` somewhere safe, such as a password manager).

## What you already have

- **Before every deploy**, `scripts/deploy.sh` copies the database to `masjid.db.bak-<date>` and keeps the last 10.
- **Every night**, `deploy/backup.cron` (installed in [DEPLOY.md](DEPLOY.md)) saves a safe copy to
  `/home/masjid/backups/` and keeps 30 days.

Both are on the same server: good for undoing a mistake, useless if the server is lost.

## Add an off-server copy (recommended)

Pick one or more:

1. **Your hosting provider's snapshots or backups.** For example, Hetzner's automatic backups cost 20% of the server
   price and keep 7 daily images of the whole server. Easiest to set up and restore.
2. **Encrypted copies to cloud storage with [restic](https://restic.net)**, e.g. to Cloudflare R2 or Backblaze B2
   (both have free or near-free tiers at this size):

   ```bash
   apt -y install restic
   # As masjid: create ~/.restic-env with the bucket address, access keys and a long RESTIC_PASSWORD (chmod 600)
   set -a; . ~/.restic-env; set +a
   restic init
   restic backup /home/masjid/backups /home/masjid/masjid-website-kit/media /home/masjid/masjid-website-kit/.env
   restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
   ```

   Add those last two lines to a nightly cron job after the database copy (e.g. 03:30). **Keep the restic password
   somewhere other than the server**: without it the backups can't be opened.

## Restore

```bash
sudo systemctl stop masjid-website
cp /home/masjid/backups/masjid-YYYY-MM-DD.db /home/masjid/masjid-website-kit/masjid.db   # as masjid
sudo systemctl start masjid-website
```

Try a restore on your own computer once, so you know the backups work before you need them: copy a backup next to
the code as `masjid.db`, run `pnpm dev`, and check the content is there.
