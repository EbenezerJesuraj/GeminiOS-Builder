#!/bin/bash
# ============================================================
# Gemini OS — ISO Build Script
# Builds the complete Gemini OS live/installable ISO
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WORK_DIR="/tmp/geminios-build"
OUT_DIR="${PROJECT_ROOT}/out"
PROFILE_SRC="${PROJECT_ROOT}/iso/profile"

echo "=========================================="
echo "  Gemini OS — ISO Builder"
echo "=========================================="

# Prepare archiso base profile
echo "[1/6] Preparing ArchISO base profile..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"
cp -r /usr/share/archiso/configs/releng/ "${WORK_DIR}/profile"

# Inject Gemini OS packages
echo "[2/6] Injecting Gemini OS package manifest..."
cat "${PROFILE_SRC}/packages.x86_64" >> "${WORK_DIR}/profile/packages.x86_64"

# Inject Gemini OS filesystem overlay
echo "[3/6] Injecting Gemini OS filesystem overlay..."
if [ -d "${PROFILE_SRC}/airootfs" ]; then
    cp -r "${PROFILE_SRC}/airootfs/"* "${WORK_DIR}/profile/airootfs/" 2>/dev/null || true
fi

# Run the profile setup script
echo "[4/6] Running profile setup script..."
if [ -f "${PROJECT_ROOT}/setup_profile.sh" ]; then
    chmod +x "${PROJECT_ROOT}/setup_profile.sh"
    bash "${PROJECT_ROOT}/setup_profile.sh" "${WORK_DIR}/profile"
fi

# Install Gemini OS services and agents
echo "[5/6] Installing Gemini OS runtime components..."
SERVICES_DIR="${WORK_DIR}/profile/airootfs/etc/systemd/system"
mkdir -p "${SERVICES_DIR}"
if [ -d "${PROJECT_ROOT}/services/systemd" ]; then
    cp "${PROJECT_ROOT}/services/systemd/"*.service "${SERVICES_DIR}/" 2>/dev/null || true
fi

# Install orchestrator, agents, and engines
INSTALL_BIN="${WORK_DIR}/profile/airootfs/usr/local/bin"
INSTALL_LIB="${WORK_DIR}/profile/airootfs/usr/lib/geminios"
mkdir -p "${INSTALL_BIN}" "${INSTALL_LIB}"

for component in orchestrator ai-agents network-engine battery-engine thermal-engine self-evolve cloud; do
    if [ -d "${PROJECT_ROOT}/${component}" ]; then
        mkdir -p "${INSTALL_LIB}/${component}"
        cp -r "${PROJECT_ROOT}/${component}/"* "${INSTALL_LIB}/${component}/" 2>/dev/null || true
    fi
done

# Build the ISO
echo "[6/6] Building Gemini OS ISO..."
mkdir -p "${OUT_DIR}"
mkarchiso -v -w "${WORK_DIR}/work" -o "${OUT_DIR}" "${WORK_DIR}/profile"

echo "=========================================="
echo "  Gemini OS ISO built successfully!"
echo "  Output: ${OUT_DIR}/"
echo "=========================================="
