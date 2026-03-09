import { ToolbarWidget } from '@angular/aria/toolbar';
import { Component, signal } from '@angular/core';
import {
    ButtonComponent,
    FeatureLayoutComponent,
    IconComponent,
    ToolbarComponent,
} from '@basenative/ui-glass';


interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showOpenFilePicker(options?: unknown): Promise<FileSystemFileHandle[]>;
}

@Component({
  selector: 'section[editor-page]',

  imports: [FeatureLayoutComponent, ButtonComponent, IconComponent, ToolbarComponent, ToolbarWidget],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  content = signal('');
  fileHandle: FileSystemFileHandle | null = null;

  async openFile() {
    try {
      const [handle] = await (window as unknown as Window).showOpenFilePicker();
      this.fileHandle = handle;
      const file = await handle.getFile();
      const text = await file.text();
      this.content.set(text);
    } catch (err) {
      console.error(err);
    }
  }

  async saveFile() {
    if (!this.fileHandle) return;
    const writable = await this.fileHandle.createWritable();
    await writable.write(this.content());
    await writable.close();
  }

  updateContent(e: Event) {
    this.content.set((e.target as HTMLTextAreaElement).value);
  }
}
