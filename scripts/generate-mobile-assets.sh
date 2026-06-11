#!/bin/bash
# generate-mobile-assets.sh
# Run from the repo root after saving the icon to apps/web/assets/icon.png
# Generates the splash screen from the icon, then runs @capacitor/assets to
# produce all iOS/Android icon and splash variants.

set -euo pipefail

ASSETS_DIR="apps/web/assets"
ICON_SRC="$ASSETS_DIR/icon.png"
SPLASH_OUT="$ASSETS_DIR/splash.png"

if [ ! -f "$ICON_SRC" ]; then
  echo "✗ Missing $ICON_SRC — save your 1024×1024 icon PNG there first."
  exit 1
fi

echo "→ Verifying icon dimensions..."
ICON_W=$(sips -g pixelWidth "$ICON_SRC" | awk '/pixelWidth/ {print $2}')
ICON_H=$(sips -g pixelHeight "$ICON_SRC" | awk '/pixelHeight/ {print $2}')
echo "   icon.png is ${ICON_W}×${ICON_H}"

if [ "$ICON_W" != "1024" ] || [ "$ICON_H" != "1024" ]; then
  echo "⚠ Expected 1024×1024 master icon. Got ${ICON_W}×${ICON_H}."
  echo "   Continuing anyway — @capacitor/assets will downscale, but quality may suffer."
fi

echo "→ Building splash.png (2732×2732, icon centered at ~33% on black)..."
# Step 1: scale the icon down to 900px (33% of 2732)
TMP_RESIZED=$(mktemp -t hiqmah_resize).png
cp "$ICON_SRC" "$TMP_RESIZED"
sips -z 900 900 "$TMP_RESIZED" > /dev/null
# Step 2: pad to 2732×2732 with black background
sips --padToHeightWidth 2732 2732 --padColor 000000 "$TMP_RESIZED" --out "$SPLASH_OUT" > /dev/null
rm -f "$TMP_RESIZED"
echo "   wrote $SPLASH_OUT"

echo "→ Running @capacitor/assets generate..."
cd apps/web
pnpm exec capacitor-assets generate \
  --ios \
  --iconBackgroundColor "#000000" \
  --iconBackgroundColorDark "#000000" \
  --splashBackgroundColor "#000000" \
  --splashBackgroundColorDark "#000000"

echo "→ Generating web PWA favicons from the master icon..."
PUBLIC_ICONS_DIR="public/icons"
mkdir -p "$PUBLIC_ICONS_DIR"

generate_web_icon() {
  local size=$1
  local out=$2
  local tmp=$(mktemp -t hiqmah_web).png
  cp "assets/icon.png" "$tmp"
  sips -z "$size" "$size" "$tmp" --out "$out" > /dev/null
  rm -f "$tmp"
}

generate_web_icon 180 "$PUBLIC_ICONS_DIR/icon-180.png"
generate_web_icon 192 "$PUBLIC_ICONS_DIR/icon-192.png"
generate_web_icon 512 "$PUBLIC_ICONS_DIR/icon-512.png"
generate_web_icon 512 "$PUBLIC_ICONS_DIR/icon-maskable-512.png"
echo "   web icons written to apps/web/public/icons/"

echo "→ Running cap sync ios..."
pnpm exec cap sync ios

echo ""
echo "✓ Done. New icon + splash baked into iOS project."
echo "  Open Xcode → ⌘+. → ⌘+Shift+K → ⌘+R to see the new icon."
