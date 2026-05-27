// Mock for @ffmpeg/util - pure ESM package that Jest cannot parse
export async function fetchFile(input) {
  if (typeof input === 'string') {
    return new Uint8Array();
  }
  return new Uint8Array();
}

export async function toBlobURL(url, mimeType) {
  return 'blob:' + url;
}
