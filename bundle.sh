#!/bin/bash
# Creates a lean deployment archive for uploading to the production server.
# Run from inside the first-app/ directory: bash bundle.sh
# Output: ../deploy_bundle.tar.gz

set -e

OUTPUT="../deploy_bundle.tar.gz"

echo "================================"
echo "Building lean deployment bundle"
echo "================================"

# Ensure the frontend assets are built
if [ ! -f "public/build/manifest.json" ]; then
    echo "ERROR: public/build/manifest.json not found."
    echo "Run 'npm run build' first, then re-run this script."
    exit 1
fi

echo "Creating archive (excluding vendor, node_modules, resources/js, tests, junk scripts)..."

tar -czf "$OUTPUT" \
    --exclude='.git' \
    --exclude='./vendor' \
    --exclude='./node_modules' \
    --exclude='./resources/js' \
    --exclude='./tests' \
    --exclude='./.env' \
    --exclude='./.env.local' \
    --exclude='./.env.example' \
    --exclude='./.env.docker' \
    --exclude='./.env.testing' \
    --exclude='./public/hot' \
    --exclude='./storage/logs/*.log' \
    --exclude='./storage/framework/cache/data/*' \
    --exclude='./storage/framework/sessions/*' \
    --exclude='./storage/framework/views/*' \
    --exclude='./storage/app/public/capex-quotations/*' \
    --exclude='./storage/app/public/asset-photos/*' \
    --exclude='./*.bat' \
    --exclude='./*.log' \
    --exclude='./*.txt' \
    --exclude='./check_*.php' \
    --exclude='./fix_*.php' \
    --exclude='./create_*.php' \
    --exclude='./get_*.php' \
    --exclude='./test_*.php' \
    --exclude='./debug_*.php' \
    --exclude='./update_*.php' \
    --exclude='./list_*.php' \
    --exclude='./render.out' \
    --exclude='./run_deploy.sh' \
    .

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo "Bundle created: $OUTPUT ($SIZE)"
echo ""
echo "Next steps:"
echo "  1. Upload the bundle to the server:"
echo "     scp $OUTPUT administrator@77.93.154.83:/var/www/simbisa/deploy_bundle.tar.gz"
echo ""
echo "  2. SSH into the server and run deploy.sh:"
echo "     ssh administrator@77.93.154.83"
echo "     cd /var/www/simbisa && bash deploy.sh"
echo ""
echo "================================"
