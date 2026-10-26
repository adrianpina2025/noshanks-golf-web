# No Shanks DEV

## Scope

The existing AWS resources named `staging` are the No Shanks DEV environment:

- S3: `noshanks-site-staging-361380116600`
- CloudFront: `E1UZKBF3T8YIJT`
- Contact API: `https://x3yeiepzhk.execute-api.us-east-1.amazonaws.com/contact`

The canonical intended DEV hostname is `https://web-dev.noshanks.golf`.

## Deployment boundary

Deployment must use GitHub OIDC and a dedicated DEV-only AWS role. That role may
only sync this repository's static output to the DEV bucket and invalidate the
DEV CloudFront distribution. It must not receive any production, DNS, certificate,
or unrelated AWS permission.

The workflow must fail if the OIDC role ARN is not configured as the repository
variable `AWS_NO_SHANKS_DEV_DEPLOY_ROLE_ARN`.

## Contact forms

The recovered site uses the existing DEV contact endpoint above. The HTTP API
currently accepts `POST /contact` and `OPTIONS /contact`; frontend changes must
retain JSON submission and browser validation. Do not reintroduce legacy PHP.

Before `web-dev.noshanks.golf` is enabled, its origin must be added to the DEV
HTTP API CORS allow-list as part of the same DEV-only hostname change.

## Production

Production bucket, distribution, aliases, DNS, certificates, Lambda, and API are
outside this repository's deployment workflow and require separate approval.

