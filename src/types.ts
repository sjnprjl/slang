export type LiteralReturnType = string | number | null | boolean;

export interface Location {
  row: number;
  col: number;
  lineContent: string;
}

export const makeLocation = (
  row: number,
  col: number,
  lineContent: string,
): Location => ({
  row,
  col,
  lineContent,
});
