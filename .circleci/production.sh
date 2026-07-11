#!/usr/bin/env bash

HTML_FILES=''

# one week in seconds
MAX_AGE='604800'

# Astro build.format:'file' already emits dist/*.html (extensionless URLs handled
# on upload below), so no react-snap directory rename is needed.
collect_html_files() {
  HTML_FILES=`ls ./dist/*.html`
}

# Set AWS defaults
configure_aws_cli() {
  echo "Configure awscli"
  echo

	aws --version
	aws configure set default.region $AWS_DEFAULT_REGION
	aws configure set default.output json
}

s3_sync() {
  echo "Syncing none html files to s3"
  echo

  # upload to s3, deleting any items that no longer exist, but exclude html files, which are handled separately below
  # (sitemap.xml + robots.txt ship in dist via public/ and are covered by this sync)
  aws s3 sync ./dist s3://$AWS_S3_BUCKET --delete --exclude="*.html"  --cache-control max-age=${MAX_AGE},public

  # upload the html files without extensions and force the content-type
  for i in ${HTML_FILES}; do
    replaceBuild=${i/\.\/dist/}
    replaceHtml=${replaceBuild/\.html/}

    # exclude index.html as it is needed for /
    if [ "$i" != "./dist/index.html" ]; then
      echo "Syncing ${replaceHtml} to s3"
      aws s3 cp $i s3://$AWS_S3_BUCKET${replaceHtml} --cache-control max-age=${MAX_AGE},public --content-type "text/html"
    else
      echo "Syncing ${replaceBuild} to s3"
      aws s3 cp $i s3://$AWS_S3_BUCKET${replaceBuild} --cache-control max-age=${MAX_AGE},public --content-type "text/html"
    fi
  done
}

# clean up cloud front
invalidate_cloudfront() {
  echo "Invalidate CloudFront"
  echo
  aws configure set preview.cloudfront true
  aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_ID --paths "/*"
}


main(){
  configure_aws_cli
  collect_html_files
  s3_sync
  invalidate_cloudfront
}

main
