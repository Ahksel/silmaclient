# Silma Web Client: Production Deployment Guide

This guide explains how to deploy Silma Web Client from scratch on a Debian-based Linux server. The same architecture works on other distributions, although package names and service-management commands may differ.

The production layout is:

```text
Browser (HTTPS/WSS)
        |
        v
Apache :443
  |-- static client files -> /opt/webapps/silmaril/silmaclient-client/
  `-- /silmaclient/ws and /silmaclient/config
                 |
                 v
        Rust gateway 127.0.0.1:8088
                 |
                 v
             MUD TCP server
```

Apache is the only public-facing process. It serves the web page, handles the TLS certificate, and proxies WebSocket and configuration requests to the Rust gateway. The gateway opens the TCP connection to the configured MUD.

## 1. Prerequisites

You need:

- a Debian server with root or `sudo` access;
- a DNS name whose A/AAAA record points to the server;
- inbound TCP ports 80 and 443 open;
- outbound TCP access from the server to the MUD host and port;
- this source repository, or a compatible prebuilt Linux binary;
- an Apache virtual host for the chosen domain.

The examples below use these values:

```text
Domain:                 mud.example.com
Gateway address:        127.0.0.1:8088
Application directory:  /opt/silmaclient
Configuration file:     /etc/silmaclient/config.toml
Static client files:    /opt/webapps/silmaril/silmaclient-client
```

Replace `mud.example.com`, the MUD destination, and any paths that differ on your server.

Commands that refer to repository files such as `deploy/`, `web/`, or `silmaclient/` are intended to be run from the repository root unless the guide explicitly changes directory.

## 2. Install operating-system packages

Install Apache, TLS tooling, and basic transfer/build utilities:

```bash
sudo apt update
sudo apt install apache2 certbot python3-certbot-apache ca-certificates curl build-essential
```

Enable the Apache modules used by the deployment:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel ssl headers rewrite
sudo systemctl restart apache2
```

If you use a firewall, allow only the public web ports. With UFW:

```bash
sudo ufw allow 'Apache Full'
```

Do not expose port 8088. The gateway must listen on loopback only.

## 3. Build or obtain the gateway binary

The binary must match the server CPU architecture and Linux ABI. For example, an `x86_64` binary cannot run on an ARM64 server. Building on the target server is the simplest compatibility option.

### Option A: build on the server

Install Rust with rustup as the unprivileged deployment/build user, not as root:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup toolchain install stable
rustup default stable
```

Copy or clone the repository onto the server, enter its Rust project directory, and run:

```bash
cd silma_web_client/silmaclient
cargo test --locked
cargo build --release --locked
cd ..
```

The resulting executable is:

```text
silmaclient/target/release/silmaclient
```

### Option B: build elsewhere and transfer the binary

Build on a Linux machine with the same architecture and a compatible or older glibc version:

```bash
cd silmaclient
cargo test --locked
cargo build --release --locked
cd ..
```

Transfer the binary and the `web/` directory to the server. One possible command, run from the repository root, is:

```bash
scp silmaclient/target/release/silmaclient admin@mud.example.com:/tmp/silmaclient
scp -r web admin@mud.example.com:/tmp/silmaclient-web
scp silmaclient/config.production.toml admin@mud.example.com:/tmp/config.production.toml
scp deploy/silmaclient.service admin@mud.example.com:/tmp/silmaclient.service
```

`admin` is only an example SSH account. Use your actual administrative account. If a transferred binary reports `Exec format error`, it was built for the wrong CPU architecture. If it reports a missing `GLIBC_*` version, rebuild it on the target server or on an older compatible Linux system.

## 4. Create the service account and directories

Create a dedicated system account without an interactive login:

```bash
sudo adduser --system --group --home /opt/silmaclient --no-create-home silmaclient
sudo install -d -o root -g root -m 0755 /opt/silmaclient
sudo install -d -o root -g silmaclient -m 0750 /etc/silmaclient
sudo install -d -o root -g root -m 0755 /opt/webapps/silmaril/silmaclient-client
```

Install the gateway binary:

```bash
sudo install -o root -g root -m 0755 /tmp/silmaclient /opt/silmaclient/silmaclient
```

If you built directly on the server, replace `/tmp/silmaclient` with the full path to `target/release/silmaclient`.

The service account only needs to read and execute the binary and read its configuration. It does not need ownership of the application files.

## 5. Configure the gateway

Start from `silmaclient/config.production.toml` or create `/etc/silmaclient/config.toml` with the following contents:

```toml
[server]
# Apache reaches the gateway through loopback. Never use 0.0.0.0 in production.
listen_address = "127.0.0.1"
listen_port = 8088

[mud]
# The TCP destination opened by the gateway for every browser connection.
host = "mud-backend.example.net"
port = 4000

[connection]
connect_timeout_seconds = 5
idle_timeout_seconds = 1800
max_connections = 100
max_websocket_message_bytes = 16384

[client]
# Number of commands retained in each browser tab's in-memory history.
command_history_size = 20

[development]
# Apache serves the static frontend in production.
serve_web = false
```

Install it with restricted permissions:

```bash
sudo install -o root -g silmaclient -m 0640 silmaclient/config.production.toml /etc/silmaclient/config.toml
```

If you transferred only the release artifacts in Option B, use `/tmp/config.production.toml` as the source instead.

Edit the installed file if necessary:

```bash
sudoedit /etc/silmaclient/config.toml
```

Configuration fields:

- `server.listen_address`: local address used by the Rust gateway. Keep it at `127.0.0.1` behind Apache.
- `server.listen_port`: local proxy port. It must match the Apache configuration.
- `mud.host` and `mud.port`: destination MUD TCP server.
- `connect_timeout_seconds`: maximum time allowed when opening the MUD connection.
- `idle_timeout_seconds`: closes a connection after this period without browser or MUD traffic.
- `max_connections`: maximum simultaneous browser/MUD bridges.
- `max_websocket_message_bytes`: maximum accepted browser WebSocket message size.
- `command_history_size`: number of commands retained by the current browser tab.
- `development.serve_web`: keep this `false` in production.

The production configuration may contain private infrastructure details. Do not commit the installed file to a public repository.

## 6. Install the systemd service

Copy `deploy/silmaclient.service` from the repository:

```bash
sudo install -o root -g root -m 0644 deploy/silmaclient.service /etc/systemd/system/silmaclient.service
sudo systemctl daemon-reload
sudo systemctl enable --now silmaclient
```

If you transferred only the release artifacts in Option B, install `/tmp/silmaclient.service` instead.

The supplied unit starts exactly:

```text
/opt/silmaclient/silmaclient /etc/silmaclient/config.toml
```

Check its status and logs:

```bash
sudo systemctl status silmaclient
sudo journalctl -u silmaclient -n 100 --no-pager
sudo journalctl -u silmaclient -f
```

Confirm that the process listens only on loopback:

```bash
sudo ss -ltnp | grep 8088
```

The expected local address is `127.0.0.1:8088`, not `0.0.0.0:8088` or a public IP address.

## 7. Deploy the browser client

Copy the contents of the repository's `web/` directory, not the directory itself, into the Apache static directory:

```bash
sudo cp -a web/. /opt/webapps/silmaril/silmaclient-client/
sudo chown -R root:root /opt/webapps/silmaril/silmaclient-client
sudo find /opt/webapps/silmaril/silmaclient-client -type d -exec chmod 0755 {} \;
sudo find /opt/webapps/silmaril/silmaclient-client -type f -exec chmod 0644 {} \;
```

If you transferred only the release artifacts in Option B, replace `web/.` with `/tmp/silmaclient-web/.`.

The client will be available at:

```text
https://mud.example.com/silmaclient-client/
```

The frontend uses the public endpoints `/silmaclient/ws` and `/silmaclient/config`. These paths must match the Apache proxy rules.

## 8. Configure Apache

Create `/etc/apache2/sites-available/mud.example.com.conf`. If the domain already has a virtual host, merge the `Alias`, `Directory`, and `ProxyPass` sections into it instead of creating a conflicting second virtual host.

An initial HTTP configuration suitable for obtaining the TLS certificate is:

```apache
<VirtualHost *:80>
    ServerName mud.example.com

    Alias /silmaclient-client/ /opt/webapps/silmaril/silmaclient-client/

    <Directory /opt/webapps/silmaril/silmaclient-client>
        Require all granted
        Options -Indexes
        AllowOverride None
        DirectoryIndex index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/silmaclient-error.log
    CustomLog ${APACHE_LOG_DIR}/silmaclient-access.log combined
</VirtualHost>
```

Enable and validate it:

```bash
sudo a2ensite mud.example.com.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Obtain and configure a Let's Encrypt certificate:

```bash
sudo certbot --apache -d mud.example.com
```

In the resulting `<VirtualHost *:443>` block, ensure these directives are present:

```apache
Alias /silmaclient-client/ /opt/webapps/silmaril/silmaclient-client/

<Directory /opt/webapps/silmaril/silmaclient-client>
    Require all granted
    Options -Indexes
    AllowOverride None
    DirectoryIndex index.html
</Directory>

ProxyPreserveHost On
ProxyPass        /silmaclient/ws     ws://127.0.0.1:8088/ws
ProxyPassReverse /silmaclient/ws     ws://127.0.0.1:8088/ws
ProxyPass        /silmaclient/config http://127.0.0.1:8088/config
ProxyPassReverse /silmaclient/config http://127.0.0.1:8088/config
```

Redirecting all port 80 traffic to HTTPS is recommended. Certbot can add this redirect automatically. After every Apache change, run:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

The repository also contains `deploy/apache.conf` as a compact integration example. Its hostname and filesystem paths are examples and must be adjusted for the target server.

## 9. Verify the deployment

First test the local gateway configuration endpoint:

```bash
curl --fail --show-error http://127.0.0.1:8088/config
```

Then test the same endpoint through Apache and TLS:

```bash
curl --fail --show-error https://mud.example.com/silmaclient/config
```

Open the client in a browser:

```text
https://mud.example.com/silmaclient-client/
```

Verify that:

1. the status changes from `Connecting…` to `Connected`;
2. the MUD welcome text appears;
3. commands reach the MUD and responses appear in the terminal;
4. after a disconnection, the `Reconnect` button establishes a new session;
5. the browser developer console contains no mixed-content or WebSocket errors.

Watch both services while testing:

```bash
sudo journalctl -u silmaclient -f
sudo tail -f /var/log/apache2/silmaclient-error.log
```

## 10. Customize the web page

The production frontend consists of ordinary static files:

```text
web/index.html
web/css/silmaclient.css
web/js/silmaclient.js
```

- Edit `index.html` for the page title, headings, labels, and additional page structure.
- Edit `css/silmaclient.css` for colors, fonts, spacing, terminal height, and responsive layout. The variables at the top of the file provide the main theme settings.
- Edit `js/silmaclient.js` only when changing behavior or public endpoint paths.

Make customizations in your source copy and redeploy the files so they are reproducible:

```bash
sudo cp -a web/. /opt/webapps/silmaril/silmaclient-client/
sudo chown -R root:root /opt/webapps/silmaril/silmaclient-client
```

When the source copy is on another machine, transfer the customized `web/` directory again and deploy it from `/tmp/silmaclient-web/` as described above.

No Rust rebuild or gateway restart is required when only the production static files change. Users may need a hard refresh if their browser cached an older CSS or JavaScript file.

The Rust binary also embeds the frontend for local development when `serve_web = true`. That embedded copy is fixed at compile time, but it is not used by the recommended Apache production setup.

Treat all MUD output as untrusted content. Keep rendering it as text and never replace the safe DOM construction with direct `innerHTML` insertion.

If you change `/silmaclient/ws`, `/silmaclient/config`, or `/silmaclient-client/`, update all corresponding JavaScript and Apache paths together.

## 11. Update an existing installation

Before an update, keep a copy of the current binary and configuration:

```bash
sudo cp /opt/silmaclient/silmaclient /opt/silmaclient/silmaclient.previous
sudo cp /etc/silmaclient/config.toml /etc/silmaclient/config.toml.previous
```

Build and test the new release, then install it and the updated static files:

```bash
sudo systemctl stop silmaclient
sudo install -o root -g root -m 0755 silmaclient/target/release/silmaclient /opt/silmaclient/silmaclient
sudo cp -a web/. /opt/webapps/silmaril/silmaclient-client/
sudo chown -R root:root /opt/webapps/silmaril/silmaclient-client
sudo systemctl start silmaclient
sudo systemctl status silmaclient
```

Adjust the source path to the binary if necessary. Existing browser/MUD connections are interrupted when the gateway restarts.

If only `config.toml` changes, restart the gateway because configuration is loaded at startup:

```bash
sudo systemctl restart silmaclient
```

If only static HTML, CSS, or JavaScript changes, copy the files without restarting the gateway.

## 12. Troubleshooting

### The systemd service does not start

Run:

```bash
sudo systemctl status silmaclient
sudo journalctl -u silmaclient -n 100 --no-pager
```

Common causes are a missing `/etc/silmaclient/config.toml`, invalid TOML, incorrect file permissions, a wrong binary architecture, or port 8088 already being used.

### Apache returns 502 Proxy Error

Confirm that the gateway is running and reachable locally:

```bash
sudo systemctl status silmaclient
curl --fail --show-error http://127.0.0.1:8088/config
```

Also confirm that `listen_port` and the Apache proxy destination both use 8088.

### The page loads but the WebSocket fails

Check that `proxy`, `proxy_http`, and `proxy_wstunnel` are enabled, the TLS virtual host contains the WebSocket proxy rules, and the browser is opening the page through HTTPS. An HTTPS page must use `wss://`, which the supplied client selects automatically.

Inspect the Apache error log and browser developer console. A reverse proxy, CDN, or load balancer placed in front of Apache must also support WebSocket upgrades and suitable connection timeouts.

### The gateway cannot connect to the MUD

Check `mud.host` and `mud.port`, DNS resolution, and outbound firewall rules. From the server, test basic TCP reachability with a tool such as Netcat:

```bash
sudo apt install netcat-openbsd
nc -vz mud-backend.example.net 4000
```

### The client page returns 403 or 404

Verify the Apache `Alias` path, the matching `<Directory>` permission block, file permissions, and the trailing slash in `/silmaclient-client/`. Then run `apache2ctl configtest` and reload Apache.

### Connections close after a period of inactivity

Increase `connection.idle_timeout_seconds` if appropriate and restart the gateway. Also check idle timeouts in Apache and in any proxy or CDN in front of it.

## 13. Production security checklist

- Keep the gateway bound to `127.0.0.1`.
- Expose only ports 80 and 443 publicly.
- Use HTTPS and keep automatic certificate renewal enabled.
- Run the gateway as the dedicated `silmaclient` system account.
- Keep the supplied systemd hardening directives unless a documented requirement conflicts with them.
- Restrict `/etc/silmaclient/config.toml` to root and the service group.
- Keep Debian, Apache, and the application updated.
- Set connection and message-size limits appropriate for the server.
- Back up the production configuration and any customized frontend source.
- Review gateway and Apache logs regularly.
- Do not place passwords, private keys, or secrets in the web files: everything served there is public.

Certbot normally installs a systemd timer for renewal. Verify it with:

```bash
systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

After completing these steps, Apache serves the customized browser client securely, the Rust gateway remains isolated on loopback, and each browser session can connect to the configured MUD through the WebSocket-to-TCP bridge.
