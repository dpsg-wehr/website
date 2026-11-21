/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*.astro' {
    const Component: (...args: unknown[]) => unknown;
    export default Component;
}
