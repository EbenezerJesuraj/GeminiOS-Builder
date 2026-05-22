#!/usr/bin/env bash
set -Eeuo pipefail

# GeminiOS Builder - Colab/Linux MVP ISO builder
#
# Usage in Google Colab:
#   !git clone https://github.com/EbenezerJesuraj/GeminiOS-Builder.git
#   %cd GeminiOS-Builder
#   !bash scripts/colab_build_iso.sh
#
# Output:
#   /content/gemini-os.iso when running in Colab
#   ./iso-output/gemini-os.iso elsewhere
#
# Note:
#   This uses ArchISO, which needs Linux kernel capabilities for mounts,
#   loop devices, and chroot-style image construction. Colab may block these
#   on some runtimes. The script detects the common failure and prints the log.

ISO_NAME="${ISO_NAME:-gemini-os}"
ISO_LABEL="${ISO_LABEL:-GEMINI_OS}"
PUBLISHER="${PUBLISHER:-Gemini OS Project}"
APPLICATION="${APPLICATION:-GeminiOS AI Control Plane}"

if [[ -d /content ]]; then
  BUILD_ROOT="${BUILD_ROOT:-/content/gemini-os-build}"
  FINAL_ISO="${FINAL_ISO:-/content/${ISO_NAME}.iso}"
else
  BUILD_ROOT="${BUILD_ROOT:-$(pwd)/.build/iso}"
  FINAL_ISO="${FINAL_ISO:-$(pwd)/iso-output/${ISO_NAME}.iso}"
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE_DIR="${BUILD_ROOT}/profile"
OUT_DIR="${BUILD_ROOT}/out"
WORK_DIR="${BUILD_ROOT}/work"
LOG_FILE="${BUILD_ROOT}/mkarchiso.log"

log() { printf '\n\033[1;36m[BUILD]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[FAIL]\033[0m %s\n' "$*"; exit 1; }

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    if command -v sudo >/dev/null 2>&1; then
      exec sudo -E bash "$0" "$@"
    fi
    fail "This script needs root privileges."
  fi
}

install_host_deps() {
  log "Installing host dependencies"
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y archiso git rsync squashfs-tools xorriso mtools dosfstools python3
  elif command -v pacman >/dev/null 2>&1; then
    pacman -Sy --noconfirm --needed archiso git rsync squashfs-tools xorriso mtools dosfstools python
  else
    fail "Unsupported host package manager. Use Ubuntu/Colab or Arch Linux."
  fi
  command -v mkarchiso >/dev/null 2>&1 || fail "mkarchiso was not installed."
  ok "Host dependencies ready"
}

create_profile() {
  log "Creating ArchISO profile"
  rm -rf "${BUILD_ROOT}"
  mkdir -p "${PROFILE_DIR}" "${OUT_DIR}" "${WORK_DIR}" "$(dirname "${FINAL_ISO}")"

  if [[ -d /usr/share/archiso/configs/releng ]]; then
    cp -a /usr/share/archiso/configs/releng/. "${PROFILE_DIR}/"
  elif [[ -d /usr/share/archiso/configs/baseline ]]; then
    cp -a /usr/share/archiso/configs/baseline/. "${PROFILE_DIR}/"
  else
    fail "Could not find an ArchISO base profile."
  fi

  cat > "${PROFILE_DIR}/profiledef.sh" <<EOF
#!/usr/bin/env bash
iso_name="${ISO_NAME}"
iso_label="${ISO_LABEL}"
iso_publisher="${PUBLISHER}"
iso_application="${APPLICATION}"
iso_version="\$(date +%Y.%m.%d)"
install_dir="arch"
buildmodes=('iso')
bootmodes=('bios.syslinux.mbr' 'bios.syslinux.eltorito' 'uefi-ia32.grub.esp' 'uefi-x64.grub.esp')
arch="x86_64"
pacman_conf="pacman.conf"
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'xz' '-Xbcj' 'x86' '-b' '1M' '-Xdict-size' '1M')
file_permissions=(
  ["/etc/shadow"]="0:0:400"
  ["/usr/local/bin/gemini-os-api"]="0:0:755"
)
EOF

  cat > "${PROFILE_DIR}/packages.x86_64" <<'EOF'
base
linux
linux-firmware
networkmanager
openssh
git
python
python-pip
python-fastapi
python-uvicorn
python-pydantic-settings
python-psutil
python-httpx
python-pytest
python-ruff
firefox
kitty
hyprland
waybar
wofi
pipewire
pipewire-pulse
wireplumber
mesa
vulkan-radeon
vulkan-intel
calamares
EOF

  mkdir -p "${PROFILE_DIR}/airootfs/opt/gemini-os-control-plane"
  rsync -a \
    --exclude .git \
    --exclude .venv \
    --exclude .build \
    --exclude iso-output \
    --exclude share.html \
    --exclude chunk.txt \
    --exclude conversation_extracted.md \
    --exclude blueprint_extracted.txt \
    "${REPO_ROOT}/" "${PROFILE_DIR}/airootfs/opt/gemini-os-control-plane/"

  mkdir -p "${PROFILE_DIR}/airootfs/usr/local/bin"
  cat > "${PROFILE_DIR}/airootfs/usr/local/bin/gemini-os-api" <<'EOF'
#!/usr/bin/env bash
cd /opt/gemini-os-control-plane
exec python -m uvicorn gemini_os.main:app --host 0.0.0.0 --port 8000
EOF

  mkdir -p "${PROFILE_DIR}/airootfs/etc/systemd/system"
  cat > "${PROFILE_DIR}/airootfs/etc/systemd/system/gemini-os-api.service" <<'EOF'
[Unit]
Description=Gemini OS FastAPI Control Plane
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/gemini-os-control-plane
ExecStart=/usr/local/bin/gemini-os-api
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  mkdir -p "${PROFILE_DIR}/airootfs/etc/systemd/system/multi-user.target.wants"
  ln -sf ../gemini-os-api.service \
    "${PROFILE_DIR}/airootfs/etc/systemd/system/multi-user.target.wants/gemini-os-api.service"
  ln -sf /usr/lib/systemd/system/NetworkManager.service \
    "${PROFILE_DIR}/airootfs/etc/systemd/system/multi-user.target.wants/NetworkManager.service"

  mkdir -p "${PROFILE_DIR}/airootfs/etc/motd.d"
  cat > "${PROFILE_DIR}/airootfs/etc/motd.d/gemini-os" <<'EOF'
Gemini OS MVP Live ISO

Control plane dashboard:
  http://127.0.0.1:8000/

API docs:
  http://127.0.0.1:8000/docs
EOF

  ok "ArchISO profile created at ${PROFILE_DIR}"
}

build_iso() {
  log "Building bootable ISO with mkarchiso"
  set +e
  mkarchiso -v -w "${WORK_DIR}" -o "${OUT_DIR}" "${PROFILE_DIR}" 2>&1 | tee "${LOG_FILE}"
  status="${PIPESTATUS[0]}"
  set -e

  if [[ "${status}" -ne 0 ]]; then
    warn "mkarchiso failed. Last 120 log lines:"
    tail -n 120 "${LOG_FILE}" || true
    fail "ISO build failed. On Google Colab this is often caused by blocked mount/loop/chroot kernel capabilities."
  fi

  iso_path="$(find "${OUT_DIR}" -maxdepth 1 -type f -name '*.iso' | sort | tail -n 1)"
  [[ -n "${iso_path}" ]] || fail "mkarchiso completed but no ISO was found."
  cp "${iso_path}" "${FINAL_ISO}"
  ok "ISO ready: ${FINAL_ISO}"
}

main() {
  require_root "$@"
  install_host_deps
  create_profile
  build_iso
}

main "$@"
