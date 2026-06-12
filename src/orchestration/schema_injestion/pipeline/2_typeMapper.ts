export function typeMap(dbType: string): string {
  const type = dbType.toLowerCase();

  if (
    type.includes("int") ||
    type.includes("bigint") ||
    type.includes("smallint") ||
    type.includes("decimal") ||
    type.includes("numeric") ||
    type.includes("float") ||
    type.includes("double")
  ) {
    return "number";
  }

  if (
    type.includes("char") ||
    type.includes("text") ||
    type.includes("varchar")
  ) {
    return "string";
  }

  if (type.includes("bool")) {
    return "boolean";
  }

  if (
    type.includes("date") ||
    type.includes("time") ||
    type.includes("timestamp")
  ) {
    return "datetime";
  }

  if (type.includes("json")) {
    return "json";
  }

  return "unknown";
}