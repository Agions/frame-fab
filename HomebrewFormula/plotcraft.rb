class FrameFlow < Formula
  desc "Professional AI-Powered Video Script Creation Platform"
  homepage "https://github.com/Agions/FrameFlow"
  url "https://github.com/Agions/FrameFlow/releases/download/v3.0.0/FrameFlow_3.0.0_aarch64.dmg"
  version "3.0.0"
  sha256 "update_after_build"

  depends_on macos: ">= :catalina"

  def install
    # Extract DMG and move app to /Applications
    system "hdiutil", "attach", "-nobrowse", "-mountpoint", "/Volumes/FrameFlow", cached_download
    system "cp", "-r", "/Volumes/FrameFlow/FrameFlow.app", "/Applications/"
    system "hdiutil", "detach", "/Volumes/FrameFlow"
  end

  post_install
    system "ln", "-sf", "/Applications/FrameFlow.app/Contents/MacOS/FrameFlow", bin/"FrameFlow"
  end

  test do
    system "#{bin}/FrameFlow", "--version"
  end
end
