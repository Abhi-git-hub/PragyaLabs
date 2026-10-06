declare module 'smtp-server' {
  export class SMTPServer {
    constructor(options?: Record<string, unknown>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, cb: (...args: any[]) => void): void;
    listen(port: number, host: string, cb?: () => void): void;
    close(cb?: () => void): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server: any;
  }
}
