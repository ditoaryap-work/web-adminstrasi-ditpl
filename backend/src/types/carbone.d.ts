declare module 'carbone' {
  export type CarboneCallback = (err: Error | null, result: Buffer | string) => void;
  export function render(templatePath: string, data: unknown, options: Record<string, unknown>, callback: CarboneCallback): void;
}
