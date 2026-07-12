#!/usr/bin/env bash
set -euo pipefail

HTML_FILES=''

# _astro/ is content-hashed → immutable 1yr
IMMUTABLE_CC='public, max-age=31536000, immutable'

# Other assets (favicon, manifest, icons, robots, sitemap) rarely change → 30d browser + edge.
ASSET_CC='public, max-age=2592000'

# HTML must refresh on deploy, short browser max-age + 30d CF edge
HTML_CC='public, max-age=300, s-maxage=2592000, must-revalidate'

# build.format:'file' emits dist/*.html; they are uploaded to extensionless keys below.
collect_html_files() {
  HTML_FILES=$(ls ./dist/*.html)
}

configure_aws_cli() {
  echo "Configure awscli"
  aws --version
  aws configure set default.region "$AWS_DEFAULT_REGION"
  aws configure set default.output json
}

s3_sync() {
  echo "Syncing fingerprinted _astro assets (immutable) to s3"
  # No --delete: keep previous content-hashed assets so clients still holding the
  # old HTML do not 404 on them. sync re-uploads (re-dates) the current set each
  # deploy, so the _astro/ bucket lifecycle rule expires only orphaned hashes.
  aws s3 sync ./dist/_astro "s3://$AWS_S3_BUCKET/_astro" \
    --cache-control "$IMMUTABLE_CC"

  echo "Syncing other static assets to s3"
  # everything else except html (handled below) and _astro (handled above)
  aws s3 sync ./dist "s3://$AWS_S3_BUCKET" --delete \
    --exclude "*.html" --exclude "_astro/*" \
    --cache-control "$ASSET_CC"

  echo "Uploading html to extensionless keys"
  for i in ${HTML_FILES}; do
    replaceBuild=${i/\.\/dist/}
    replaceHtml=${replaceBuild/\.html/}

    # index.html stays at /index.html (root default object); others become extensionless keys
    if [ "$i" != "./dist/index.html" ]; then
      echo "  ${replaceHtml}"
      aws s3 cp "$i" "s3://$AWS_S3_BUCKET${replaceHtml}" \
        --cache-control "$HTML_CC" --content-type "text/html"
    else
      echo "  ${replaceBuild}"
      aws s3 cp "$i" "s3://$AWS_S3_BUCKET${replaceBuild}" \
        --cache-control "$HTML_CC" --content-type "text/html"
    fi
  done
}

invalidate_cloudfront() {
  # /* invalidates _astro too, which is fine: those hashed assets stay in S3 (the sync
  # does not delete them), so a cache miss re-fetches from the origin instead of 404ing.
  echo "Invalidate CloudFront"
  aws cloudfront create-invalidation --distribution-id "$AWS_CLOUDFRONT_ID" --paths "/*"
}

main() {
  configure_aws_cli
  collect_html_files
  s3_sync
  invalidate_cloudfront
}

main
