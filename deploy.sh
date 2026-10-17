#!/usr/bin/env bash
# Deploy the soundboard code to S3 + CloudFront. The mp3 folders are never touched.
#
#   ./deploy.sh            -> live site  https://dragons.seeingisbelieving.be/
#   ./deploy.sh preview/   -> test copy  https://dragons.seeingisbelieving.be/preview/index.html
#
# Needs the AWS CLI with access to the bucket and the CloudFront distribution.
set -euo pipefail

BUCKET="ghentdragons.soundboard"
DISTRIBUTION="EMH19E4D8LSQQ"
PREFIX="${1:-}"

cd "$(dirname "$0")"
VERSION="$(date +%Y%m%d-%H%M%S)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -R index.html sw.js manifest.webmanifest css js assets "$TMP/"
rm -rf "$TMP/assets/src"
# New service-worker version => phones fetch the new app shell
sed -i.bak "s/^const VERSION = '[^']*';/const VERSION = '$VERSION';/" "$TMP/sw.js" && rm "$TMP/sw.js.bak"
# The preview copy reads the mp3s from the live folders one level up
if [ -n "$PREFIX" ]; then
  sed -i.bak 's|<meta name="lxd-audio-base" content="">|<meta name="lxd-audio-base" content="../">|' "$TMP/index.html" && rm "$TMP/index.html.bak"
fi

upload() { # file content-type cache-control
  aws s3 cp "$TMP/$1" "s3://$BUCKET/$PREFIX$1" --content-type "$2" --cache-control "$3" --only-show-errors
}

cd "$TMP"
find . -type f | sed 's|^\./||' | while read -r f; do
  case "$f" in
    *.html)        upload "$f" "text/html; charset=utf-8" "no-cache" ;;
    *.js)          upload "$f" "text/javascript; charset=utf-8" "no-cache" ;;
    *.css)         upload "$f" "text/css; charset=utf-8" "no-cache" ;;
    *.webmanifest) upload "$f" "application/manifest+json" "no-cache" ;;
    *.webp)        upload "$f" "image/webp" "public, max-age=604800" ;;
    *.jpg)         upload "$f" "image/jpeg" "public, max-age=604800" ;;
    *.png)         upload "$f" "image/png" "public, max-age=604800" ;;
    *.woff2)       upload "$f" "font/woff2" "public, max-age=31536000, immutable" ;;
    *)             echo "skip $f" ;;
  esac
done

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" \
  --paths "/${PREFIX}index.html" "/${PREFIX}sw.js" "/${PREFIX}manifest.webmanifest" "/${PREFIX}css/*" "/${PREFIX}js/*" "/${PREFIX}" >/dev/null

echo "Deployed $VERSION -> https://dragons.seeingisbelieving.be/${PREFIX}"
