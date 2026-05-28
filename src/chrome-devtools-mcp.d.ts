declare module 'chrome-devtools-mcp' {
  export function startCapture(page: any, filePath: string): Promise<void>;
  export function stopCapture(page: any): Promise<void>;
}
