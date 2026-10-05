# almostimplemented.com

Personal site for Drew Edwards. Plain static HTML, Bootstrap 3 from CDN, no build step.

- `index.html` is the entry page: the jumbotron intro and a nav bar.
- `research/`, `projects/`, `music/` are the sub-pages, all sharing the same header and nav.
- `css/theme.css`, `css/transition.css`, and `js/` hold the small amount of shared styling and the page-transition script.
- `resources/cv.pdf` is a 2017 CV kept so old links don't break. It is no longer linked from the site.

## Deploy

The site is served by nginx on a DigitalOcean droplet. `./deploy.sh` rsyncs the working tree there over one SSH connection:

```
./deploy.sh                                   # reads the docroot from nginx config
./deploy.sh --password                        # skip SSH keys, prompt for a password once
./deploy.sh root@almostimplemented.com /path  # or say user and docroot explicitly
```

## Continuous deploy

`.github/workflows/deploy.yml` runs `deploy.sh` on every push to `master`. It needs repo secrets:

- `DEPLOY_SSH_KEY`: private half of a key whose public half is in `~/.ssh/authorized_keys` on the droplet
- `DEPLOY_USER`: the login on the droplet
- `DEPLOY_PATH`: the nginx docroot (optional; the script reads it from nginx config if unset)

The server's host key is pinned in the workflow. If the droplet is rebuilt, update that line.
