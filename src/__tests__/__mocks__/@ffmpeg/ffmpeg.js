// Mock for @ffmpeg/ffmpeg - pure ESM package that Jest cannot parse
export class FFmpeg {
  loaded: boolean = false;

  async load() {
    this.loaded = true;
  }

  async exec() {
    return 0;
  }

  async writeFile() {}
  async readFile() {
    return new Uint8Array();
  }
  async deleteFile() {}
  async createDir() {}
  async deleteDir() {}
  async listDir() {
    return [];
  }
  async rename() {}
  async readDir() {
    return [];
  }
  on() {}
  off() {}
  terminate() {}
}
