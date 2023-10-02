export const match = <T>(t: T, a: T[]) => {
  return a.some((b) => b === t);
};
