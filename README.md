# almostimplemented.com

Personal site for Drew Edwards. Plain static HTML, Bootstrap 3 from CDN, no build step.

- `index.html` is the entry page: the jumbotron intro and a nav bar.
- `research/`, `projects/`, `music/` are the sub-pages, all sharing the same header and nav.
- `css/theme.css`, `css/transition.css`, and `js/` hold the small amount of shared styling and the page-transition script.
- `resources/cv.pdf` is a 2017 CV kept so old links don't break. It is no longer linked from the site.

## Deploy

Hosted on Vercel (project `web`). Every push to `master` deploys to almostimplemented.com; other branches get preview URLs. `vercel.json` holds clean URLs, cache headers, and redirects for removed pages. DNS for the domain lives at DigitalOcean.
