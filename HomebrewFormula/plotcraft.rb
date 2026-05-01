class PanelFlow < Formula
  desc "Professional AI-Powered Video Script Creation Platform"
  homepage "https://github.com/Agions/PanelFlow"
  url "https://github.com/Agions/PanelFlow/releases/download/v3.0.0/PanelFlow_3.0.0_aarch64.dmg"
  version "3.0.0"
  sha256 "update_after_build"

  depends_on macos: ">= :catalina"

  def install
    # Extract DMG and move app to /Applications
    system "hdiutil", "attach", "-nobrowse", "-mountpoint", "/Volumes/PanelFlow", cached_download
    system "cp", "-r", "/Volumes/PanelFlow/PanelFlow.app", "/Applications/"
    system "hdiutil", "detach", "/Volumes/PanelFlow"
  end

  post_install
    system "ln", "-sf", "/Applications/PanelFlow.app/Contents/MacOS/PanelFlow", bin/"PanelFlow"
  end

  test do
    system "#{bin}/PanelFlow", "--version"
  end
end
