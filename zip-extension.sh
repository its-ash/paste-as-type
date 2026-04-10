#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_PATH="${ROOT_DIR}/manifest.json"
DIST_DIR="${ROOT_DIR}/dist"

if [[ ! -f "${MANIFEST_PATH}" ]]; then
  echo "Error: manifest.json not found at ${MANIFEST_PATH}" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: 'zip' command is required. Install it and re-run." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: 'node' is required to read extension name/version from manifest.json." >&2
  exit 1
fi

PACKAGE_BASENAME="$(
  node -e '
    const manifest = require(process.argv[1]);
    const safeName = (manifest.name || "chrome-extension")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const version = manifest.version || "0.0.0";
    process.stdout.write(`${safeName}-${version}`);
  ' "${MANIFEST_PATH}"
)"

mkdir -p "${DIST_DIR}"
ZIP_PATH="${DIST_DIR}/${PACKAGE_BASENAME}.zip"
rm -f "${ZIP_PATH}"

(
  cd "${ROOT_DIR}"
  zip -r "${ZIP_PATH}" . \
    -x "dist/*" \
    -x ".git/*" \
    -x ".DS_Store" \
    -x "*/.DS_Store" \
    -x "*.zip"
)

echo "Extension package created:"
echo "${ZIP_PATH}"
