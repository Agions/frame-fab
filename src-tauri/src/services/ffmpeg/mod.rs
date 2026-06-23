//! FFmpeg execution service.
//!
//! Wraps the `ffmpeg` and `ffprobe` system binaries with safety guarantees:
//! - Always invoked via `Command::new("ffmpeg").args(...)` (no shell), preventing
//!   command injection via argument values.
//! - Stderr is captured for error reporting.
//! - Generic argument splitting helper for use with server-controlled preset strings.

use std::ffi::OsStr;
use std::process::Command;

/// Execute ffmpeg with a list of string args, returning Ok(()) on success.
/// On failure, returns the captured stderr as part of the error string.
pub fn run_ffmpeg<T: AsRef<OsStr>>(args: &[T]) -> Result<(), String> {
    let output = Command::new("ffmpeg")
        .args(args)
        .output()
        .map_err(|e| format!("执行FFmpeg命令失败: {}", e))?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg错误: {}", err));
    }
    Ok(())
}

/// Split a space-separated flag+value string into individual args for ffmpeg.
/// Only handles simple whitespace splitting — no shell variable/quote interpretation.
/// Use this only with server-controlled strings (e.g. quality presets),
/// never with user input.
pub fn split_ffmpeg_args(s: &str) -> Vec<String> {
    s.split_whitespace().map(|x| x.to_string()).collect()
}

/// Check whether `ffmpeg` is available on the system PATH.
pub fn is_ffmpeg_installed() -> bool {
    Command::new("ffmpeg")
        .arg("-version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn split_simple_args() {
        // 【v3.1 修正】"scale=1920:1080" 是 -vf 的值（含等号），split_whitespace 不再拆分
        // 因此 6 token：-vf, scale=1920:1080, -b:v, 4M, -preset, fast
        let args = split_ffmpeg_args("-vf scale=1920:1080 -b:v 4M -preset fast");
        assert_eq!(args.len(), 6);
        assert_eq!(args[0], "-vf");
        assert_eq!(args[1], "scale=1920:1080");
        assert_eq!(args[5], "fast");
    }

    #[test]
    fn split_handles_extra_whitespace() {
        let args = split_ffmpeg_args("  -foo  bar  baz  ");
        assert_eq!(args, vec!["-foo", "bar", "baz"]);
    }

    #[test]
    fn split_empty_string() {
        let args = split_ffmpeg_args("");
        assert!(args.is_empty());
    }
}
