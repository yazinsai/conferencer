export type MergeFields = Record<string, string | undefined | null>;

export function applyMergeFields(template: string, fields: MergeFields) {
  return template.replace(/\{([a-z_]+)\}/gi, (_, key: string) => {
    const v = fields[key];
    return v == null ? "" : String(v);
  });
}
