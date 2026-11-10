/** Pick distinct eligible machines for all operations, reassigning earlier choices if needed. */
export const selectLifecycleEquipment = (candidates: number[][]): number[] | undefined => {
  const owners = new Map<number, number>();
  const selected: number[] = [];
  const assign = (operation: number, visited: Set<number>): boolean => {
    for (const id of candidates[operation]) {
      if (!Number.isInteger(id) || id <= 0 || visited.has(id)) continue;
      visited.add(id);
      const owner = owners.get(id);
      if (owner === undefined || assign(owner, visited)) {
        owners.set(id, operation);
        selected[operation] = id;
        return true;
      }
    }
    return false;
  };
  for (let operation = 0; operation < candidates.length; operation++) {
    if (!assign(operation, new Set())) return undefined;
  }
  return selected;
};
