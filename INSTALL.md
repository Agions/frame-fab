# Install PanelFlow

## macOS

### Option 1: Homebrew (Recommended)
```bash
# First, tap the PanelFlow repository
brew tap Agions/tap https://github.com/Agions/homebrew-tap

# Then install PanelFlow
brew install --cask PanelFlow
```

### Option 2: Download DMG
Download the latest `.dmg` from [GitHub Releases](https://github.com/Agions/PanelFlow/releases/latest) and drag `PanelFlow.app` to `/Applications`.

### Option 3: Install Script
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Agions/PanelFlow/main/scripts/install.sh)"
```

---

## Windows

Download the latest `.exe` (NSIS installer) or `.msi` from [GitHub Releases](https://github.com/Agions/PanelFlow/releases/latest) and run it.

---

## Linux

### Debian/Ubuntu
```bash
curl -sL https://raw.githubusercontent.com/Agions/PanelFlow/main/scripts/install.sh | bash
```
Or download the `.deb` from [GitHub Releases](https://github.com/Agions/PanelFlow/releases/latest) and run:
```bash
sudo dpkg -i PanelFlow_*.deb
```

### Arch Linux (AUR)
```bash
yay -S PanelFlow
```

---

## Build from Source
```bash
git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow
npm install && npm run tauri build
```
