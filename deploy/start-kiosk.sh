#!/usr/bin/env bash
set -euo pipefail

pkill -f "chromium.*kiosk" || true
sleep 1

exec chromium \
  --kiosk \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  --ozone-platform=wayland \
  --disable-features=UsePreferredIntervalForVideo \
  --disable-frame-rate-limit \
  "file://$HOME/Bublink/dist/index.html"
