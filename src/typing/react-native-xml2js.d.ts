declare module 'react-native-xml2js';

interface ParseStringOptions {
  // define options here based on what the Parser supports
}

export type ParseStringCallback = (err: Error | null, result: any) => void;

export function parseString(
  str: string,
  options?: ParseStringOptions,
  callback?: ParseStringCallback,
): void;
export function parseString(str: string, callback?: ParseStringCallback): void;
