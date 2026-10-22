import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as brandIcons from "@fortawesome/free-brands-svg-icons";
import * as regularIcons from "@fortawesome/free-regular-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Prevent FontAwesome from auto-injecting CSS since we imported styles.css above
config.autoAddCss = false;

// Helper to convert kebab-case "house", "file-spreadsheet", "wand-magic-sparkles"
// to PascalCase fontawesome name "faHouse", "faFileSpreadsheet", etc.
export function toFaName(name: string): string {
  if (name.startsWith("fa") && name.length > 2 && name[2] === name[2].toUpperCase()) {
    return name;
  }
  const clean = name.replace(/^(fa-|fa)/, "");
  const parts = clean.split(/[-_]/).filter(Boolean);
  const capitalized = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return `fa${capitalized}`;
}

// Handler for Proxy lookup
function createIconProxy(
  primarySet: Record<string, any>,
  fallbackSet?: Record<string, any>
): Record<string, IconDefinition> {
  const target: Record<string, IconDefinition> = {};
  return new Proxy(target, {
    get: (_, prop: string | symbol) => {
      if (typeof prop !== "string") return undefined;
      const key = toFaName(prop);
      if (primarySet[key]) return primarySet[key] as IconDefinition;
      if (fallbackSet && fallbackSet[key]) return fallbackSet[key] as IconDefinition;
      if (primarySet[prop]) return primarySet[prop] as IconDefinition;
      return solidIcons.faCircleQuestion as IconDefinition;
    },
  });
}

/**
 * Universal byPrefixAndName lookup compatible with FontAwesome Kit & standard syntax:
 * - byPrefixAndName.fas['house'] or byPrefixAndName.fans['house']
 * - byPrefixAndName.fab['github']
 * - byPrefixAndName.far['clock']
 */
export const byPrefixAndName = {
  fas: createIconProxy(solidIcons),
  fans: createIconProxy(solidIcons),
  fab: createIconProxy(brandIcons, solidIcons),
  far: createIconProxy(regularIcons, solidIcons),
};

export { FontAwesomeIcon };
export type { IconDefinition };
