#!/bin/sh
# Build index.html (the website) from src/. Run from the repository root: sh scripts/build.sh
# Script order matters: data and question banks, then past papers, then app logic, smart practice, daily coach and revision, JEE, PDFs, sync, Firebase sign-in.
set -e
cd "$(dirname "$0")/.."
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>CoachYourWard · CBSE Class 10 board prep</title><meta name="description" content="CBSE Class 10 board exam preparation: study plan, notes, solved past papers and timed tests."><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/png" href="/icons/icon-192.png"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="CoachYourWard"></head><body>'
  cat src/shell.html
  echo "<script>"; cat src/data.js src/sanskrit.js src/bank*.js src/papers.js src/papers-*.js; echo "</script>"
  for f in app prep coach report jee print sync firebase-config fbsync pwa; do echo "<script>"; cat src/$f.js; echo "</script>"; done
  echo '</body></html>'
} > index.html
echo "Built index.html ($(wc -c < index.html) bytes)"
