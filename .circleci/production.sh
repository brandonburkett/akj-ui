#!/usr/bin/env bash

HTML_FILES=''
MAX_AGE='86400'

# remove extension from html files
rename_html_files() {
  echo "Renaming react-snap files"
  echo

  buildHTML=`ls ./build/*/index.html`

  for i in ${buildHTML}; do
    # move file - EX build/iaijutsu/index.html -> build/iaijutsu.html
    echo ${i} | sed 'p;s/\/index\.html/.html/' | xargs -n2 mv

    # delete folders that contained files - EX /build/iaijutsu
    rm -rf ${i/\/index\.html//}

    # remove .html extension - EX build/iaijutsu.html -> build/iaijutsu
    #mv ${i/\/\index\.html/\.html} ${i/\/index\.html/}
  done

  # setup HTML_FILES, which we will be moving manually
  HTML_FILES=`ls ./build/*.html`
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
  aws s3 sync ./build s3://$AWS_S3_BUCKET --delete --exclude="*.html"  --cache-control max-age=${MAX_AGE},public

  # upload the html files without extensions and force the content-type
  for i in ${HTML_FILES}; do
    replaceBuild=${i/\.\/build/}
    replaceHtml=${replaceBuild/\.html/}

    # exclude index.html as it is needed for /
    if [ "$i" != "./build/index.html" ]; then
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
  aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_ID --paths /js/check-browser/index.js
}


main(){
  configure_aws_cli
  rename_html_files
  s3_sync
  invalidate_cloudfront
}

main
