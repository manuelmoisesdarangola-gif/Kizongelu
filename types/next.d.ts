declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }
}

declare module 'next/font/google' {
  export function Inter(options?: {
    subsets?: string[];
    display?: string;
    variable?: string;
  }): {
    variable: string;
    className: string;
  };
}
