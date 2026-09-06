#!/usr/bin/env bash
# Vendors Portico (HLA RTI) into a repo-local Maven repository.
# See docs/architecture/portico-setup.md for the full explanation.
#
# Extracts portico.jar (pure Java, platform-independent) from the official
# linux64 release asset rather than building from source — the native C++
# libraries in that archive are not needed since federation-kernel only uses
# Portico's Java API. This works regardless of the developer's own OS,
# including macOS, which has no native Portico release asset.

set -euo pipefail

PORTICO_TAG="portico-2.1.4"
PORTICO_ASSET="portico-2.1.4-linux64.tar.gz"
PORTICO_ASSET_URL="https://github.com/openlvc/portico/releases/download/${PORTICO_TAG}/${PORTICO_ASSET}"
PORTICO_COMMIT="337d309d949774c594cf12d3ff1109659dfc0825"
PORTICO_VERSION="2.1.4"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$REPO_ROOT/vendor/portico"
MAVEN_REPO_DIR="$REPO_ROOT/vendor/maven-repo"
MAVEN_REPO_URL="file://$MAVEN_REPO_DIR"
GROUP_ID="org.openlvc"
ARTIFACT_ID="portico"

command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }
command -v mvn >/dev/null || { echo "mvn (Maven) is required" >&2; exit 1; }
command -v tar >/dev/null || { echo "tar is required" >&2; exit 1; }

mkdir -p "$VENDOR_DIR" "$MAVEN_REPO_DIR"

ARCHIVE="$VENDOR_DIR/$PORTICO_ASSET"
if [ ! -f "$ARCHIVE" ]; then
  echo "Downloading $PORTICO_ASSET_URL ..."
  curl -fsSL -o "$ARCHIVE" "$PORTICO_ASSET_URL"
fi

ARCHIVE_SHA256="$(shasum -a 256 "$ARCHIVE" | awk '{print $1}')"

EXTRACT_DIR="$VENDOR_DIR/extracted"
rm -rf "$EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"
tar -xzf "$ARCHIVE" -C "$EXTRACT_DIR"

PORTICO_JAR="$(find "$EXTRACT_DIR" -name portico.jar | head -n1)"
if [ -z "$PORTICO_JAR" ]; then
  echo "portico.jar not found inside $PORTICO_ASSET — the release layout may have changed." >&2
  echo "See docs/architecture/portico-setup.md 'Fallback: build from source'." >&2
  exit 1
fi

LICENSE_FILE="$(find "$EXTRACT_DIR" -iname 'LICENSE.portico' | head -n1)"
if [ -n "$LICENSE_FILE" ]; then
  cp "$LICENSE_FILE" "$VENDOR_DIR/LICENSE.portico"
fi

mvn deploy:deploy-file \
  -Dfile="$PORTICO_JAR" \
  -DgroupId="$GROUP_ID" -DartifactId="$ARTIFACT_ID" -Dversion="$PORTICO_VERSION" \
  -Dpackaging=jar \
  -Durl="$MAVEN_REPO_URL" -DrepositoryId=vendor-local

cat > "$VENDOR_DIR/PROVENANCE.md" <<EOF
# Portico vendoring provenance

- Source: https://github.com/openlvc/portico
- Tag: $PORTICO_TAG
- Commit: $PORTICO_COMMIT
- Asset: $PORTICO_ASSET_URL
- Archive SHA-256: $ARCHIVE_SHA256
- Vendored on: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- portico.jar extracted from: $PORTICO_JAR (relative to $EXTRACT_DIR)
- License: CDDL v1.0 — see LICENSE.portico in this directory
- Installed to local Maven repo: $MAVEN_REPO_URL as $GROUP_ID:$ARTIFACT_ID:$PORTICO_VERSION
- Native C++ libraries in the source archive were NOT extracted or used —
  federation-kernel depends only on Portico's Java API (tech-stack.md).
EOF

echo "Portico $PORTICO_VERSION installed to $MAVEN_REPO_URL"
echo "Provenance recorded at $VENDOR_DIR/PROVENANCE.md"
echo "Set <portico.version>$PORTICO_VERSION</portico.version> in packages/federation-kernel/pom.xml (already set if unmodified)."
