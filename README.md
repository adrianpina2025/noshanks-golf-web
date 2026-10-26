# No Shanks Marketing Website

Canonical source for the No Shanks public marketing website.

## Current baseline

`legacy-baseline/` is an exact recovery of the existing No Shanks DEV static site
from `noshanks-site-staging-361380116600`. It is intentionally preserved before
any design or content work.

The recovered site is a static HTML/CSS/JavaScript export. There is no framework
source map or build manifest in the deployed assets, so static files are the
selected maintainable baseline rather than a reconstructed framework project.

## Local preview

```sh
cd legacy-baseline
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080`.

## Development and release

All website changes follow feature branch → PR/review → `main` → DEV only.

The DEV target is the existing private S3 bucket
`noshanks-site-staging-361380116600`, served through CloudFront distribution
`E1UZKBF3T8YIJT`. No workflow in this repository deploys to production.

See [docs/DEV.md](docs/DEV.md) for the environment boundary and deployment
requirements.

