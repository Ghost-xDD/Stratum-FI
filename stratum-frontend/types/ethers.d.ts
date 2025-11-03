/**
 * Type overrides for ethers library to fix IPC socket provider type errors
 * This file excludes unused IPC provider from type checking
 */

declare module 'ethers/providers/provider-ipcsocket' {
  const content: any;
  export = content;
}

declare module 'ethers/src.ts/providers/provider-ipcsocket' {
  const content: any;
  export = content;
}
