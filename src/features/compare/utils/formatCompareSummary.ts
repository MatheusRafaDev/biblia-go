export interface VersionComparisonItem {
  translationId: string;
  text: string;
}

export function formatComparisonClipboard(
  reference: string,
  versions: VersionComparisonItem[]
): string {
  const lines = [`📊 Comparação de Traduções — ${reference}`, ''];

  for (const v of versions) {
    lines.push(`[${v.translationId}]: ${v.text}`);
  }

  lines.push('', '— Bíblia Go');
  return lines.join('\n');
}
