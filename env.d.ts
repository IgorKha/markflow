/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module "*?worker" {
  const WorkerFactory: {
    new(): Worker;
  };
  export default WorkerFactory;
}

declare module "*?inline" {
  const content: string;
  export default content;
}
