import { constants } from 'node:fs';
import { lstat, open } from 'node:fs/promises';
import { isAbsolute, join, parse, sep } from 'node:path';
import { ConfigurationError, MAX_CONFIGURATION_BYTES } from './schema.js';

export function validateAbsolutePath(path: string): void {
  if (
    typeof path !== 'string' ||
    !isAbsolute(path) ||
    path.includes('\0') ||
    (path !== sep &&
      path
        .split(sep)
        .slice(1)
        .some((segment) => ['', '.', '..'].includes(segment)))
  ) {
    throw new ConfigurationError('INVALID_PATH');
  }
}

// No implicit cwd, tilde expansion, symlink traversal or directory creation.
export async function checkDirectoryChain(path: string): Promise<void> {
  validateAbsolutePath(path);
  let current = parse(path).root;
  for (const component of path
    .slice(current.length)
    .split(sep)
    .filter(Boolean)) {
    current = join(current, component);
    const info = await lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new ConfigurationError('INVALID_PATH');
  }
}

export async function checkPrivateEntry(
  path: string,
  directory: boolean,
): Promise<void> {
  const info = await lstat(path);
  if (
    info.isSymbolicLink() ||
    (directory ? !info.isDirectory() : !info.isFile()) ||
    (info.mode & 0o777) !== (directory ? 0o700 : 0o600) ||
    (process.getuid && info.uid !== process.getuid()) ||
    (!directory && info.nlink !== 1)
  ) {
    throw new ConfigurationError('INVALID_PATH');
  }
}

export async function readJsonFile(
  path: string,
  privateFile = false,
): Promise<unknown> {
  validateAbsolutePath(path);
  const file = await open(
    path,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const info = await file.stat();
    if (
      !info.isFile() ||
      info.size > MAX_CONFIGURATION_BYTES ||
      (privateFile &&
        ((info.mode & 0o777) !== 0o600 ||
          info.nlink !== 1 ||
          (process.getuid && info.uid !== process.getuid())))
    ) {
      throw new ConfigurationError('INVALID_PATH');
    }
    // Read at most the limit plus one byte even if the file grows after stat.
    const buffer = Buffer.alloc(MAX_CONFIGURATION_BYTES + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        size,
        buffer.length - size,
        null,
      );
      if (bytesRead === 0) break;
      size += bytesRead;
    }
    if (size > MAX_CONFIGURATION_BYTES)
      throw new ConfigurationError('INVALID_CONFIG');
    try {
      return JSON.parse(buffer.subarray(0, size).toString('utf8')) as unknown;
    } catch {
      throw new ConfigurationError('INVALID_CONFIG');
    }
  } finally {
    await file.close();
  }
}

export function filesystemError(error: unknown): ConfigurationError {
  if (error instanceof ConfigurationError) return error;
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'EEXIST'
  ) {
    return new ConfigurationError('ALREADY_INITIALIZED');
  }
  return new ConfigurationError('CONFIG_IO');
}
