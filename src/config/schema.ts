import { z } from 'zod';

export const DEFAULT_STORAGE_LIMIT_BYTES = 100 * 1024 * 1024;
export const MAX_CONFIGURATION_BYTES = 64 * 1024;

// Aliases are operator-declared, nonidentifying names, never page-derived IDs.
const alias = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/);
const origin = z
  .string()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        url.origin === value &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  });
const route = z
  .string()
  .max(1024)
  .regex(/^\/(?:[a-zA-Z0-9_:/.-]*)$/)
  .refine(
    (value) =>
      !value.split('/').some((segment) => segment === '..' || segment === '.'),
  );
const profile = z.strictObject({
  alias,
  version: z.number().int().positive(),
  allowed_labels: z.array(z.string().min(1).max(4096)).max(1000),
  ignored_fields: z.array(alias).max(100),
  unknown_text: z.literal('drop'),
});
const app = z
  .strictObject({
    alias,
    allowed_origins: z.array(origin).min(1).max(50),
    scopes: z
      .array(
        z.strictObject({
          alias,
          environment: alias,
          origin,
          role: alias.default('unknown'),
          account_scope: alias,
          locale: z.string().regex(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/),
        }),
      )
      .min(1)
      .max(100),
    route_mappings: z
      .array(
        z.strictObject({
          view_key: alias,
          origin,
          route_template: route,
        }),
      )
      .max(1000),
    redaction_profiles: z.array(profile).min(1).max(50),
  })
  .superRefine((value, context) => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    if (
      !unique(value.allowed_origins) ||
      !unique(value.scopes.map((scope) => scope.alias)) ||
      !unique(value.route_mappings.map((mapping) => mapping.view_key)) ||
      !unique(value.redaction_profiles.map((entry) => entry.alias))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Duplicate configuration identity',
      });
    }
    if (
      [...value.scopes, ...value.route_mappings].some(
        (entry) => !value.allowed_origins.includes(entry.origin),
      )
    ) {
      context.addIssue({ code: 'custom', message: 'Origin is not configured' });
    }
  });

const settingsShape = {
  project_alias: alias,
  apps: z.array(app).min(1).max(50),
  storage_limit_bytes: z
    .number()
    .int()
    .positive()
    .max(Number.MAX_SAFE_INTEGER)
    .default(DEFAULT_STORAGE_LIMIT_BYTES),
};
export const initializationSchema = z
  .strictObject(settingsShape)
  .refine(
    (value) =>
      new Set(value.apps.map((entry) => entry.alias)).size ===
      value.apps.length,
  );
export const configurationSchema = z
  .strictObject({
    ...settingsShape,
    schema_version: z.literal(1),
    project_id: z.uuid(),
    apps: z
      .array(app.safeExtend({ app_id: z.uuid() }))
      .min(1)
      .max(50),
  })
  .superRefine((value, context) => {
    if (
      new Set(value.apps.map((entry) => entry.alias)).size !==
        value.apps.length ||
      new Set([value.project_id, ...value.apps.map((entry) => entry.app_id)])
        .size !==
        value.apps.length + 1
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Duplicate configuration identity',
      });
    }
  });
export type Configuration = z.infer<typeof configurationSchema>;

export class ConfigurationError extends Error {
  constructor(
    public readonly code:
      'INVALID_CONFIG' | 'INVALID_PATH' | 'ALREADY_INITIALIZED' | 'CONFIG_IO',
  ) {
    super(code);
    this.name = 'ConfigurationError';
  }
}

export function validateSettings(input: unknown) {
  const result = initializationSchema.safeParse(input);
  if (!result.success) throw new ConfigurationError('INVALID_CONFIG');
  return result.data;
}

export function validateConfiguration(input: unknown): Configuration {
  const result = configurationSchema.safeParse(input);
  if (!result.success) throw new ConfigurationError('INVALID_CONFIG');
  return result.data;
}
