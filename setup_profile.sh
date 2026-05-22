#!/bin/bash
# ====================================================================
# Gemini OS — Profile Configuration & Filesystem Injection Script
# Builds the complete Gemini OS live environment overlay
# ====================================================================
set -e

PROFILE_DIR="$1"
if [ -z "$PROFILE_DIR" ]; then
    echo "Error: Profile directory target missing."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROFILE_DIR"

echo "=========================================="
echo "  Gemini OS — Profile Setup"
echo "=========================================="

# 1. Inject extended package manifest
echo "[1/8] Injecting Gemini OS package manifest..."
if [ -f "${SCRIPT_DIR}/iso/profile/packages.x86_64" ]; then
    cat "${SCRIPT_DIR}/iso/profile/packages.x86_64" >> packages.x86_64
else
    cat << 'EOF' >> packages.x86_64
hyprland
rofi-wayland
waybar
mako
rclone
networkmanager
polkit-kde-agent
ttf-jetbrains-mono-nerd
python-requests
python-aiohttp
python-fastapi
python-psutil
kvantum
nwg-look
python-pywal
foot
kitty
thunar
chromium
ollama
swww
grim
slurp
wl-clipboard
pipewire
pipewire-pulse
wireplumber
EOF
fi

# 2. Establish directory structures
echo "[2/8] Creating directory structures..."
mkdir -p airootfs/etc/skel/.config/{hypr,waybar,rofi,mako,ags}
mkdir -p airootfs/usr/local/bin
mkdir -p airootfs/usr/lib/geminios
mkdir -p airootfs/etc/systemd/system
mkdir -p airootfs/etc/geminios
mkdir -p airootfs/var/lib/geminios/{models,cache,state,logs,memory}
mkdir -p airootfs/var/lib/geminios/self-evolve/{snapshots,rollback,manifests}

# 3. Inject Hyprland config (futuristic AI-native desktop)
echo "[3/8] Installing Hyprland configuration..."
if [ -f "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/hypr/hyprland.conf" ]; then
    cp "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/hypr/hyprland.conf" \
       airootfs/etc/skel/.config/hypr/hyprland.conf
fi

# 4. Inject Waybar config and styles
echo "[4/8] Installing Waybar configuration..."
if [ -d "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/waybar" ]; then
    cp -r "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/waybar/"* \
       airootfs/etc/skel/.config/waybar/
fi

# 5. Inject Rofi and Mako configs
echo "[5/8] Installing UI component configs..."
if [ -d "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/rofi" ]; then
    cp -r "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/rofi/"* \
       airootfs/etc/skel/.config/rofi/
fi
if [ -d "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/mako" ]; then
    cp -r "${SCRIPT_DIR}/iso/profile/airootfs/etc/skel/.config/mako/"* \
       airootfs/etc/skel/.config/mako/
fi

# 6. Install all Gemini OS shell scripts and tools
echo "[6/8] Installing Gemini OS tools..."
if [ -d "${SCRIPT_DIR}/iso/profile/airootfs/usr/local/bin" ]; then
    cp "${SCRIPT_DIR}/iso/profile/airootfs/usr/local/bin/"* \
       airootfs/usr/local/bin/ 2>/dev/null || true
    chmod +x airootfs/usr/local/bin/gemini-* 2>/dev/null || true
fi

# Also keep the legacy gemini-os-ctl tool
cat << 'CTLEOF' > airootfs/usr/local/bin/gemini-os-ctl
#!/usr/bin/env python3
"""Gemini OS Control — Legacy CLI interface for OS automation."""
import os
import sys
import requests
import subprocess

def prompt_os_change(user_intent):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.")
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

    system_instruction = (
        "You are the core automation engine for Gemini OS, an AI-native Linux distribution. "
        "The user will ask you to make a change to their OS. "
        "You must respond ONLY with valid, executable Bash scripting commands. "
        "Do not include markdown formatting, backticks, or text explanations. "
        "Output raw shell commands only."
    )

    payload = {
        "contents": [{"parts": [{"text": f"{system_instruction}\n\nUser request: {user_intent}"}]}]
    }

    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code == 200:
            raw_script = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            return raw_script.replace("```bash", "").replace("```", "").strip()
    except Exception as e:
        print(f"Network failure: {str(e)}")
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: gemini-os-ctl \"your command\"")
        print("Tip: Use the Gemini Shell (Super+Space) for a better experience.")
        sys.exit(1)

    user_command = sys.argv[1]
    executable_actions = prompt_os_change(user_command)

    if executable_actions:
        print(f"\n[Gemini OS Automation Plan]:\n{executable_actions}\n")
        if input("Execute updates? (y/N): ").lower() == "y":
            process = subprocess.run(executable_actions, shell=True, text=True, capture_output=True)
            if process.returncode == 0:
                print("System modifications executed successfully.")
            else:
                print(f"Error:\n{process.stderr}")
CTLEOF
chmod +x airootfs/usr/local/bin/gemini-os-ctl

# 7. Install Gemini OS runtime components
echo "[7/8] Installing Gemini OS runtime..."
for component in orchestrator ai-agents network-engine battery-engine thermal-engine self-evolve cloud; do
    if [ -d "${SCRIPT_DIR}/${component}" ]; then
        mkdir -p "airootfs/usr/lib/geminios/${component}"
        cp -r "${SCRIPT_DIR}/${component}/"* \
           "airootfs/usr/lib/geminios/${component}/" 2>/dev/null || true
    fi
done

# Install systemd service files
if [ -d "${SCRIPT_DIR}/services/systemd" ]; then
    cp "${SCRIPT_DIR}/services/systemd/"*.service \
       airootfs/etc/systemd/system/ 2>/dev/null || true
fi

# 8. Configure auto-login to graphical environment (no terminal)
echo "[8/8] Configuring auto-start..."
cat << 'EOF' >> airootfs/etc/skel/.bashrc
# Gemini OS — Auto-start Hyprland (no terminal by default)
if [ -z "$DISPLAY" ] && [ "$XDG_VTNR" -eq 1 ]; then
  exec Hyprland
fi
EOF

echo "=========================================="
echo "  Gemini OS profile setup complete!"
echo "=========================================="
