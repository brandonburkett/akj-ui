#!/usr/bin/env bash

buildHTML=`ls ../build/*/index.html`

for i in ${buildHTML}; do
  # move file - EX build/iaijutsu/index.html -> build/iaijutsu.html
  echo ${i} | sed 'p;s/\/index\.html/.html/' | xargs -n2 mv

  # delete folders that contained files - EX /build/iaijutsu
  rm -rf ${i/\/index\.html//}

  # remove .html extension - EX build/iaijutsu.html -> build/iaijutsu
  mv ${i/\/\index\.html/\.html} ${i/\/index\.html/}
done
