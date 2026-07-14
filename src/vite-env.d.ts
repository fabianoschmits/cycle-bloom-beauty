/// <reference types="vite-plugin-pwa/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'l-hourglass': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string | number;
      color?: string;
      speed?: string | number;
      "bg-opacity"?: string | number;
    };
  }
}
