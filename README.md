# almostimplemented.com

Personal site for Drew Edwards. Plain static HTML, Bootstrap 3 from CDN, no build step.

- `index.html` is the entry page: the jumbotron intro and a nav bar.
- `research/`, `projects/`, `music/` are the sub-pages, all sharing the same header and nav.
- `projects/mandelbrot/` and `projects/julia-mandelbrot/` are standalone WebGL demos.
- `css/theme.css`, `css/transition.css`, and `js/` hold the small amount of shared styling and the page-transition script.
- `resources/cv.pdf` is a 2017 CV kept so old links don't break. It is no longer linked from the site.

## Deploy

The site is served by nginx on a DigitalOcean droplet. `./deploy.sh` rsyncs the working tree there over one SSH connection:

```
./deploy.sh                                   # reads the docroot from nginx config
./deploy.sh --password                        # skip SSH keys, prompt for a password once
./deploy.sh root@almostimplemented.com /path  # or say user and docroot explicitly
```
