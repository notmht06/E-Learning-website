#!/usr/bin/env bash
# ============================================================================
# Hayat Automated Nightly Database & Media Backup Script
# پایگاه رسمی نشر آثار و دروس حجت الاسلام دکتر زنجیر زن حسینی
# Usage (Cron at 03:00 AM): 0 3 * * * /bin/bash /opt/hayat/scripts/backup_production.sh
# ============================================================================
set -euo pipefail

# Always ensure working directory is project root even when triggered by Cron
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
cd "${PROJECT_ROOT}"

# Source environment variables if .env exists (critical for headless Cron jobs)
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "${PROJECT_ROOT}/.env" 2>/dev/null || true
    set +a
fi

BACKUP_ROOT="${BACKUP_ROOT:-${PROJECT_ROOT}/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "${BACKUP_ROOT}"

echo "[$(date)] Starting Hayat production backup..."

# 1. Backup PostgreSQL Database (if running via Docker)
TARGET_CONTAINER=""
if command -v docker >/dev/null 2>&1; then
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^hayat-postgres$"; then
        TARGET_CONTAINER="hayat-postgres"
    elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^daralhikmah-postgres$"; then
        TARGET_CONTAINER="daralhikmah-postgres"
    fi
fi

if [ -n "${TARGET_CONTAINER}" ]; then
    DB_DUMP_FILE="${BACKUP_ROOT}/db_backup_${TIMESTAMP}.sql.gz"
    docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-hikmat_strong_pass_2026}" "${TARGET_CONTAINER}" pg_dump -U "${POSTGRES_USER:-hikmat_user}" "${POSTGRES_DB:-hayat_db}" | gzip > "${DB_DUMP_FILE}"
    echo "[$(date)] PostgreSQL dump saved to ${DB_DUMP_FILE}"
elif [ -f "./zanjirzan_platform.db" ]; then
    # Fallback SQLite backup
    SQLITE_BACKUP_FILE="${BACKUP_ROOT}/sqlite_backup_${TIMESTAMP}.db.gz"
    gzip -c "./zanjirzan_platform.db" > "${SQLITE_BACKUP_FILE}"
    echo "[$(date)] SQLite database backed up to ${SQLITE_BACKUP_FILE}"
else
    echo "[$(date)] Warning: Neither postgres container nor zanjirzan_platform.db was found."
fi

# 2. Backup Uploaded Media & Audio Transcripts Index
UPLOADS_DIR="./backend/app/static/uploads"
if [ -d "${UPLOADS_DIR}" ]; then
    MEDIA_ARCHIVE="${BACKUP_ROOT}/uploads_backup_${TIMESTAMP}.tar.gz"
    tar -czf "${MEDIA_ARCHIVE}" -C "${UPLOADS_DIR}" .
    echo "[$(date)] Media & RAG transcripts backed up to ${MEDIA_ARCHIVE}"
fi

# 3. Prune backups older than RETENTION_DAYS
find "${BACKUP_ROOT}" -type f -name "*.gz" -mtime +"${RETENTION_DAYS}" -delete
echo "[$(date)] Backup completed successfully. Old archives (> ${RETENTION_DAYS} days) pruned."
