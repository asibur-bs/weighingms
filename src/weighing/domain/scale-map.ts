/** Recipe scale label → Dummy Scale id. Training assignment only (Q15 unresolved). */
export function scaleIdFromRecipeLabel(label: string): "scale-3kg" | "scale-32kg" {
  const t = label.toLowerCase();
  if (t.includes("32")) return "scale-32kg";
  return "scale-3kg";
}
