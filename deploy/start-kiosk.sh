#!/usr/bin/env bash
set -euo pipefail

pkill -f "chromium.*kiosk" || true
sleep 1

chromium_args=(
  --kiosk
  --no-first-run
  --disable-session-crashed-bubble
  --disable-infobars
  --autoplay-policy=no-user-gesture-required
)

if [[ -n "${DISPLAY:-}" ]]; then
  chromium_args+=(file://$HOME/kiosk/index.html)
else
  chromium_args+=(
    --ozone-platform=wayland
    --disable-features=UsePreferredIntervalForVideo
    --disable-frame-rate-limit
    file://$HOME/kiosk/index.html
  )
fi

exec chromium "${chromium_args[@]}"
