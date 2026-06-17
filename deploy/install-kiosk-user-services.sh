#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$HOME/bin" "$HOME/.config/systemd/user"

install -m 755 "$script_dir/start-kiosk.sh" "$HOME/bin/start-kiosk.sh"
install -m 644 "$script_dir/systemd-user/"*.service "$HOME/.config/systemd/user/"
install -m 644 "$script_dir/systemd-user/"*.timer "$HOME/.config/systemd/user/"

systemctl --user daemon-reload
systemctl --user enable kiosk-chromium.service
systemctl --user enable --now kiosk-morning.timer
systemctl --user enable --now kiosk-night.timer

echo "Installed kiosk user services."
echo "Morning start: 07:00"
echo "Morning stop:  08:00"
echo
echo "Add these lines to ~/.config/sway/config if they are not already present:"
echo 'exec systemctl --user import-environment DISPLAY WAYLAND_DISPLAY SWAYSOCK XDG_CURRENT_DESKTOP'
echo 'exec systemctl --user start kiosk-chromium.service'
