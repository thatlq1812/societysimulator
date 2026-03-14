export function getStratificationLevel(stratification: number): 'normal' | 'warning' | 'danger' {
  if (stratification >= 70) return 'danger'
  if (stratification >= 60) return 'warning'
  return 'normal'
}
