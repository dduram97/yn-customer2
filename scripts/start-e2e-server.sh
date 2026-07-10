#!/bin/zsh
cd "/Users/dohee/Desktop/바이브코딩/yn-customer2" || exit 1
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY='*'
export no_proxy='*'

echo "[e2e] starting next on :3030 (production build)..."
npx next start -p 3030 -H 127.0.0.1
