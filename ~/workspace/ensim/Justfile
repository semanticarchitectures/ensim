# Coordinates the TypeScript (pnpm) and Java (Maven) sides of the monorepo.
# See docs/architecture/tech-stack.md for why there are two build tools.

# Validate the org-doctrine-model seed data against its JSON Schema.
validate-org-doctrine:
    cd packages/org-doctrine-model && npm install && npm run validate

# Vendor Portico (must edit scripts/setup-portico.sh's TODOs first — see docs/architecture/portico-setup.md).
setup-portico:
    ./scripts/setup-portico.sh

# Build the federation-kernel Java module (requires setup-portico to have run first).
build-federation-kernel:
    cd packages/federation-kernel && mvn -q package

# Placeholder — expand as packages come online.
build:
    just validate-org-doctrine
