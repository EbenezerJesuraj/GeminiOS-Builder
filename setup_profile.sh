#!/bin/bash
# ====================================================================
# GeminiOS Profile Configuration & File System Injection Script
# ====================================================================
set -e

PROFILE_DIR="$1"
if [ -z "$PROFILE_DIR" ]; then
    echo "Error: Profile directory target missing."
    exit 1
fi

cd "$PROFILE_DIR"

# 1. Expand the package list to include all core, theme, and utility tools
echo "Injecting software selection into the live system manifest..."
cat << 'EOF' >> packages.x86_64
hyprland
rofi-wayland
rclone
networkmanager
polkit-kde-agent
ttf-jetbrains-mono-nerd
python-requests
kvantum
nwg-look
python-pywal
EOF

# 2. Establish baseline system structures
mkdir -p airootfs/etc/skel/.config/hyprland
mkdir -p airootfs/etc/skel/.config/ags
mkdir -p airootfs/usr/local/bin

# 3. Create the transparent, glass-style Hyprland environment config
cat << 'EOF' > airootfs/etc/skel/.config/hyprland/hyprland.conf
monitor=,preferred,auto,1

# Core background services
exec-once = ags &
exec-once = nm-applet &

general {
    gaps_in = 6
    gaps_out = 12
    border_size = 2
    col.active_border = rgba(FF0080EE) rgba(B300FFAA) 45deg
    col.inactive_border = rgba(595959aa)
    layout = dwindle
}

decoration {
    rounding = 12
    drop_shadow = true
    shadow_range = 20
    col.shadow = rgba(00000044)
    
    blur {
        enabled = true
        size = 8
        passes = 3
        new_optimizations = true
    }
}

# Centered window rules for development terminals (Tabby)
windowrule = float, ^(tabby)$
windowrule = center, ^(tabby)$
windowrule = size 900 650, ^(tabby)$

# System-wide layout hotkeys
bind = SUPER, Q, exec, tabby
bind = SUPER, R, exec, rofi -show drun
bind = SUPER, C, killactive,
bind = SUPER, M, exit,
EOF

# 4. Inject the interactive Gemini System Automation Engine
cat << 'EOF' > airootfs/usr/local/bin/gemini-os-ctl
#!/usr/bin/env python3
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
        "You are the core automation engine for GeminiOS, a Hyprland Linux distribution. "
        "The user will ask you to make a change to their OS. "
        "You must respond ONLY with valid, executable Bash scripting commands that execute these changes directly. "
        "Do not include markdown formatting, backticks, or text explanations. Output raw shell commands only."
    )

    payload = {
        "contents": [{"parts": [{"text": f"{system_instruction}\n\nUser request: {user_intent}"}]}]
    }
    
    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code == 200:
            raw_script = response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            return raw_script.replace("```bash", "").replace("
```", "").strip()
    except Exception as e:
        print(f"Network failure: {str(e)}")
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: gemini-os-ctl \"command\"")
        sys.exit(1)
        
    user_command = sys.argv[1]
    executable_actions = prompt_os_change(user_command)
    
    if executable_actions:
        print(f"\n[Gemini System Automation Plan]:\n{executable_actions}\n")
        if input("Execute updates? (y/N): ").lower() == 'y':
            process = subprocess.run(executable_actions, shell=True, text=True, capture_output=True)
            print("System modifications executed successfully." if process.returncode == 0 else f"Error:\n{process.stderr}")
EOF
chmod +x airootfs/usr/local/bin/gemini-os-ctl

# 5. Route default boot shell directly into the graphic environment
cat << 'EOF' >> airootfs/etc/skel/.bashrc
if [ -z "$DISPLAY" ] && [ "$XDG_VTNR" -eq 1 ]; then
  exec Hyprland
fi
EOF
