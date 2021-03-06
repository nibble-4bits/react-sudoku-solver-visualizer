import { createRef } from 'react';
import { Board } from '../typings/Board';
import { deepCopy, random, shuffle } from './util';

/**
 * Generates and returns an empty sudoku board
 */
export function generateEmptySudokuBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: 0, isGiven: false }))
  );
}

/**
 * Generates and returns a solvable sudoku board
 */
export function generateSolvableSudokuBoard(): Board {
  const initialSudoku = generateEmptySudokuBoard();
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
    initialSudoku[row][col].value = 0;
  }

  for (let i = 0; i < initialSudoku.length; i++) {
    for (let j = 0; j < initialSudoku[i].length; j++) {
      initialSudoku[i][j].isGiven = initialSudoku[i][j].value > 0;
    }
  }

  return initialSudoku;
}

/**
 * Generates a 9-by-9 array of refs
 */
export function generateSudokuCellRefs<T>(): React.RefObject<T>[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => createRef()));
}

/**
 * Checks whether a cell (given its row) is part of a certain row in the sudoku board
 * @param referenceRow The row to test against
 * @param testRow The row of the cell to test if it belongs to the `referenceRow`
 */
export function isCellInRow(referenceRow: number, testRow: number): boolean {
  if (referenceRow < 0) return false;

  return referenceRow === testRow;
}

/**
 * Checks whether a cell (given its column) is part of a certain column in the sudoku board
 * @param referenceCol The column to test against
 * @param testCol The column of the cell to test if it belongs to the `referenceRow`
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

/**
 * Checks whether a particular value can be validly placed in a certain cell of a sudoku board
 * @param testValue The value to be checked
 * @param row The row index of the cell where `testValue` is tried to be placed
 * @param col The column index of the cell where `testValue` is tried to be placed
 * @param sudoku The sudoku board
 */
export function isValidValue(testValue: number, row: number, col: number, sudoku: Board): boolean {
  return (
    isValidRowValue(testValue, row, sudoku) &&
    isValidColValue(testValue, col, sudoku) &&
    isValidBoxValue(testValue, row, col, sudoku)
  );
}

/**
 * Checks whether a particular value can be validly placed in a certain row of a sudoku board
 * @param testValue The value to be checked
 * @param row The row index of the cell where `testValue` is tried to be placed
 * @param sudoku The sudoku board
 */
export function isValidRowValue(testValue: number, row: number, sudoku: Board): boolean {
  for (let x = 0; x < sudoku[row].length; x++) {
    const currCell = sudoku[row][x];
    if (testValue === currCell.value) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether a particular value can be validly placed in a certain column of a sudoku board
 * @param testValue The value to be checked
 * @param col The column index of the cell where `testValue` is tried to be placed
 * @param sudoku The sudoku board
 */
export function isValidColValue(testValue: number, col: number, sudoku: Board): boolean {
  for (let y = 0; y < sudoku.length; y++) {
    const currCell = sudoku[y][col];
    if (testValue === currCell.value) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether a particular value can be validly placed in a certain box of a sudoku board
 * @param testValue The value to be checked
 * @param row The row index of the cell where `testValue` is tried to be placed
 * @param col The column index of the cell where `testValue` is tried to be placed
 * @param sudoku The sudoku board
 */
export function isValidBoxValue(
  testValue: number,
  row: number,
  col: number,
  sudoku: Board
): boolean {
  const rowStart = row - (row % 3);
  const rowEnd = rowStart + 3;
  const colStart = col - (col % 3);
  const colEnd = colStart + 3;

  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = colStart; x < colEnd; x++) {
      const currCell = sudoku[y][x];
      if (testValue === currCell.value) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Finds the first cell that is empty in a sudoku board
 * @param sudoku The sudoku board to check for an empty cell
 */
export function findNextEmptyCell(sudoku: Board): [number, number] | null {
  for (let i = 0; i < sudoku.length; i++) {
    for (let j = 0; j < sudoku[i].length; j++) {
      if (!sudoku[i][j].value) {
        return [i, j];
      }
    }
  }

  return null;
}

export function solveSudoku(sudoku: Board, fillCellsSequentially = true, steps?: Board[]): boolean {
  if (steps) steps.push(deepCopy(sudoku) as Board);

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
      sudoku[row][col].value = possibleNum;

      if (solveSudoku(sudoku, fillCellsSequentially, steps)) {
        return true;
      }

      sudoku[row][col].value = 0;
    }
  }

  return false;
}

export function solveSudokuSteps(sudoku: Board): Board[] | null {
  const steps: Board[] = [];

  const solved = solveSudoku(sudoku, true, steps);

  if (solved) return steps;
  return null;
}
