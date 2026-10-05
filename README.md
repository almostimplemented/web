# almostimplemented.com

Personal site for Drew Edwards. Plain static HTML and CSS, no build step.

- `index.html` is the whole site (about, now, research, code, music).
- `css/site.css` styles it, with light and dark themes.
- `music/` and `projects/` redirect old URLs to sections of the front page.
- `projects/mandelbrot/` and `projects/julia-mandelbrot/` are old standalone WebGL demos. They still use `css/theme.css`, `css/transition.css`, and `js/`, so those stay.
- `resources/cv.pdf` is a 2017 CV kept so old links don't break. It is no longer linked from the site.

## Deploy

The site is served by nginx on a DigitalOcean droplet. `./deploy.sh` rsyncs the working tree there:

```
./deploy.sh                                   # reads the docroot from nginx config
./deploy.sh root@almostimplemented.com /path  # or say where explicitly
```
