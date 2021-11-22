import { createRef } from 'react';
import { deepCopyArray, random, shuffle } from './util';

export function generateEmptySudokuBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

export function generateSolvableSudokuBoard(): number[][] {
  const initialSudoku = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
  const cellPositions = [];

  solveSudoku(initialSudoku, false);

  for (let i = 0; i < initialSudoku.length; i++) {
    for (let j = 0; j < initialSudoku[i].length; j++) {
      cellPositions.push([i, j]);
    }
  }

  // Randomly remove between 48 and 62 cells from the generated sudoku
  const emptyCells = random(48, 62);
  const shuffledCellPositions = shuffle(cellPositions).slice(0, emptyCells);

  for (let i = 0; i < shuffledCellPositions.length; i++) {
    const [row, col] = shuffledCellPositions[i];
    initialSudoku[row][col] = 0;
  }

  return initialSudoku;
}

export function generateSudokuCellRefs<T>(): React.RefObject<T>[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => createRef()));
}

/**
 * Checks whether a cell (given its row) is part of a certain row in the sudoku board
 * @param referenceRow The row to test against
 * @param testRow The row of the cell to test if it belongs to the `referenceRow`
 * @returns boolean
 */
export function isCellInRow(referenceRow: number, testRow: number): boolean {
  if (referenceRow < 0) return false;

  return referenceRow === testRow;
}

/**
 * Checks whether a cell (given its column) is part of a certain column in the sudoku board
 * @param referenceCol The column to test against
 * @param testCol The column of the cell to test if it belongs to the `referenceRow`
 * @returns boolean
 */
export function isCellInCol(referenceCol: number, testCol: number): boolean {
  if (referenceCol < 0) return false;

  return referenceCol === testCol;
}

/**
 * Checks whether a cell (given its row and column) is part of a certain box in the sudoku board
 * @param referenceRow The row to test against
 * @param referenceCol The column to test against
 * @param testRow The row of the cell to test if it belongs to the `referenceRow`
 * @param testCol The column of the cell to test if it belongs to the `referenceCol`
 * @returns boolean
 */
export function isCellInBox(
  referenceRow: number,
  referenceCol: number,
  testRow: number,
  testCol: number
): boolean {
  if (referenceRow < 0 || referenceCol < 0) return false;

  const rowStart = referenceRow - (referenceRow % 3);
  const rowEnd = rowStart + 3;
  const colStart = referenceCol - (referenceCol % 3);
  const colEnd = colStart + 3;

  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = colStart; x < colEnd; x++) {
      if (y === testRow && x === testCol) {
        return true;
      }
    }
  }

  return false;
}

export function isValidValue(
  testValue: number,
  row: number,
  col: number,
  sudoku: number[][]
): boolean {
  return (
    isValidRowValue(testValue, row, sudoku) &&
    isValidColValue(testValue, col, sudoku) &&
    isValidBoxValue(testValue, row, col, sudoku)
  );
}

export function isValidRowValue(testValue: number, row: number, sudoku: number[][]): boolean {
  for (let x = 0; x < sudoku[row].length; x++) {
    const currValue = sudoku[row][x];
    if (testValue === currValue) {
      return false;
    }
  }

  return true;
}

export function isValidColValue(testValue: number, col: number, sudoku: number[][]): boolean {
  for (let y = 0; y < sudoku.length; y++) {
    const currValue = sudoku[y][col];
    if (testValue === currValue) {
      return false;
    }
  }

  return true;
}

export function isValidBoxValue(
  testValue: number,
  row: number,
  col: number,
  sudoku: number[][]
): boolean {
  const rowStart = row - (row % 3);
  const rowEnd = rowStart + 3;
  const colStart = col - (col % 3);
  const colEnd = colStart + 3;

  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = colStart; x < colEnd; x++) {
      const currValue = sudoku[y][x];
      if (testValue === currValue) {
        return false;
      }
    }
  }

  return true;
}

export function findNextEmptyCell(sudoku: number[][]): [number, number] | null {
  for (let i = 0; i < sudoku.length; i++) {
    for (let j = 0; j < sudoku[i].length; j++) {
      if (!sudoku[i][j]) {
        return [i, j];
      }
    }
  }

  return null;
}

export function solveSudoku(
  sudoku: number[][],
  fillCellsSequentially = true,
  steps?: number[][][]
): boolean {
  if (steps) steps.push(deepCopyArray(sudoku) as number[][]);

  const emptyCell = findNextEmptyCell(sudoku);
  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;
  let possibleNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (!fillCellsSequentially) {
    possibleNums = shuffle(possibleNums);
  }

  for (const possibleNum of possibleNums) {
    if (isValidValue(possibleNum, row, col, sudoku)) {
      sudoku[row][col] = possibleNum;

      if (solveSudoku(sudoku, fillCellsSequentially, steps)) {
        return true;
      }

      sudoku[row][col] = 0;
    }
  }

  return false;
}

export function solveSudokuSteps(sudoku: number[][]): number[][][] | null {
  const steps: number[][][] = [];

  const solved = solveSudoku(sudoku, true, steps);

  if (solved) return steps;
  return null;
}
