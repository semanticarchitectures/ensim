#!/usr/bin/env bash
# Vendors Portico (HLA RTI) into a repo-local Maven repository.
# See docs/architecture/portico-setup.md for the full explanation and caveats.
#
# STATUS: skeleton — two TODOs below must be confirmed against the live
# github.com/openlvc/portico repo before this will run unattended. It was
# written without live access to GitHub from the authoring environment;
# do not assume the pinned values are correct without checking first.

set -euo pipefail

REPO_URL="https://github.com/openlvc/portico.git"

# TODO: confirm this is a real, current tag or commit before relying on it.
# Do not leave this as "master" for a real build — pin something specific.
PORTICO_REF="__CONFIRM_PINNED_COMMIT_OR_TAG__"

VENDOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vendor/portico"
MAVEN_REPO_URL="file://$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vendor/maven-repo"
GROUP_ID="org.openlvc"
ARTIFACT_ID="portico"

command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
command -v mvn >/dev/null || { echo "mvn (Maven) is required" >&2; exit 1; }

if [ "$PORTICO_REF" = "__CONFIRM_PINNED_COMMIT_OR_TAG__" ]; then
  echo "Refusing to run: PORTICO_REF has not been set to a confirmed commit/tag." >&2
  echo "Check https://github.com/openlvc/portico/tags first, then edit this script." >&2
  exit 1
fi

mkdir -p "$VENDOR_DIR"
if [ ! -d "$VENDOR_DIR/src" ]; then
  git clone "$REPO_URL" "$VENDOR_DIR/src"
fi
cd "$VENDOR_DIR/src"
git checkout "$PORTICO_REF"

# TODO: confirm the current build command — this repo has historically used
# an Ant-based build under codebase/. Check codebase/build.xml or the repo's
# own README at the pinned ref before trusting this line.
echo "TODO: run this repo's actual build command here (see codebase/ and its README)." >&2
exit 1

# Once the build produces portico.jar, uncomment and adjust:
# PORTICO_JAR="$(find . -name 'portico.jar' | head -n1)"
# mvn deploy:deploy-file \
#   -Dfile="$PORTICO_JAR" \
#   -DgroupId="$GROUP_ID" -DartifactId="$ARTIFACT_ID" -Dversion="$PORTICO_REF" \
#   -Dpackaging=jar \
#   -Durl="$MAVEN_REPO_URL" -DrepositoryId=vendor-local
#
# echo "Portico $PORTICO_REF installed to $MAVEN_REPO_URL"
# echo "Record commit hash, build date, and license location in vendor/portico/PROVENANCE.md"
