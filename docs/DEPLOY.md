# Hosting the site on your own server

This guide puts the site on a small Linux server (a "VPS") with your own domain and HTTPS, and sets up
automatic deploys: push to GitHub and the site updates itself. It is the setup the original site runs on.
Allow an hour or so the first time.

You need:

- a domain name you can edit DNS records for (e.g. `example.org`);
- a VPS running **Ubuntu 24.04** with 2 GB of memory or more (e.g. Hetzner CX22/CX23, DigitalOcean Basic, about £4–6 a month);
- your own copy of this repository on GitHub: click **Use this template** (or **Fork**) at the top of the GitHub page.

In the commands below, replace `example.org` with your domain and `YOUR-GITHUB-NAME` with your GitHub account.

## 1. Point your domain at the server

At your domain provider, add two DNS records pointing at the server's IP address:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | your server's IPv4 address |
| CNAME | `www` | `example.org` |

Leave your email records (MX and so on) alone.

## 2. Install the software (as root)

```bash
ssh root@YOUR-SERVER-IP
apt update && apt -y upgrade
apt -y install nginx certbot sqlite3 git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
corepack enable
adduser --disabled-password --gecos "" masjid
```

## 3. Get the code and build it (as the `masjid` user)

```bash
sudo -iu masjid
corepack prepare pnpm@10 --activate
git clone https://github.com/YOUR-GITHUB-NAME/masjid-website-kit.git
cd masjid-website-kit
cp .env.example .env
sed -i "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$(openssl rand -hex 32)/" .env
nano .env                      # set NEXT_PUBLIC_SITE_TIMEZONE and TOTP_ISSUER
pnpm install --frozen-lockfile
pnpm payload migrate
pnpm build
exit
```

If your repository is private, add a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)
for the `masjid` user first and clone with the `git@github.com:…` address.

## 4. Run it as a service (as root)

```bash
cp /home/masjid/masjid-website-kit/deploy/masjid-website.service /etc/systemd/system/
nano /etc/systemd/system/masjid-website.service      # set TZ= to your timezone
systemctl daemon-reload
systemctl enable --now masjid-website
curl -I http://127.0.0.1:3000                         # expect HTTP/1.1 200
```

## 5. HTTPS with nginx (as root)

First a temporary site so Let's Encrypt can check you own the domain:

```bash
cat > /etc/nginx/sites-available/masjid-website <<'EOF'
server {
    listen 80;
    server_name example.org www.example.org;
    location /.well-known/acme-challenge/ { root /var/www/html; }
}
EOF
ln -sf /etc/nginx/sites-available/masjid-website /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot certonly --webroot -w /var/www/html -d example.org -d www.example.org
```

Then install the full site configuration and replace `example.org` in it:

```bash
cp /home/masjid/masjid-website-kit/deploy/nginx-site.conf /etc/nginx/sites-available/masjid-website
sed -i 's/example\.org/YOUR-DOMAIN/g' /etc/nginx/sites-available/masjid-website
nginx -t && systemctl reload nginx
```

Certificates renew automatically. Visit `https://example.org/admin` and create the first account: it becomes the
administrator, and you'll set up two-factor login straight away. Then fill in Site Settings (see the README).

## 6. Automatic deploys from GitHub

On the server (as root), let the `masjid` user restart the site, and install the nightly backup:

```bash
cd /home/masjid/masjid-website-kit
visudo -cf deploy/sudoers-masjid && install -m 440 deploy/sudoers-masjid /etc/sudoers.d/masjid
cp deploy/backup.cron /etc/cron.d/masjid-backup
```

Create a key pair just for deploys and allow it to log in as `masjid`:

```bash
ssh-keygen -t ed25519 -N "" -C github-deploy -f /root/github-deploy
mkdir -p /home/masjid/.ssh && cat /root/github-deploy.pub >> /home/masjid/.ssh/authorized_keys
chown -R masjid:masjid /home/masjid/.ssh && chmod 700 /home/masjid/.ssh && chmod 600 /home/masjid/.ssh/authorized_keys
cat /root/github-deploy        # copy this private key into GitHub (next step), then:
rm /root/github-deploy /root/github-deploy.pub
```

In your repository on GitHub, open **Settings → Secrets and variables → Actions** and add:

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `DEPLOY_HOST` | your server's IP address or domain |
| Secret | `DEPLOY_USER` | `masjid` |
| Secret | `DEPLOY_SSH_KEY` | the private key you copied |
| Variable | `DEPLOY_DIR` | `/home/masjid/masjid-website-kit` |
| Variable | `DEPLOY_ENABLED` | `true` |

From now on every push to `main` runs `scripts/deploy.sh` on the server: pull, install, back up the database, migrate,
build and restart. You can also run it by hand: `sudo -iu masjid bash ~/masjid-website-kit/scripts/deploy.sh`.

## 7. Backups

The cron job above keeps 30 days of nightly copies **on the same server**. That protects against mistakes, not
against losing the server. Set up an off-server copy too: see [BACKUPS.md](BACKUPS.md).

## Getting updates from this kit

```bash
git remote add upstream https://github.com/durakkerem/masjid-website-kit.git
git fetch upstream
git merge upstream/main        # review, then push to deploy
```

## Troubleshooting

- **Site down?** `systemctl status masjid-website` and `journalctl -u masjid-website -n 100`.
- **Deploy failed?** Open the failed run under the **Actions** tab on GitHub: the log shows the server's output.
- **Build runs out of memory** on a 1 GB server: add swap (`fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`, plus a line in `/etc/fstab`) or choose a 2 GB server.
- **Locked out of the admin panel** (too many wrong codes, or a lost phone)? Another administrator can unlock you
  under Users. If you are the only administrator, keep your authenticator's backup codes or recovery options safe.
