import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import {
  generateSudokuBoard,
  generateSudokuCellRefs,
  isCellInBox,
  isCellInCol,
  isCellInRow,
  isValidValue,
} from '../util/sudoku';
import { clamp } from '../util/util';
import SudokuCell from './SudokuCell';

const Wrapper = styled.div`
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-rows: repeat(9, 1fr);
  grid-template-columns: repeat(9, 1fr);
  border: 6px solid #000;
`;

function SudokuBoard(): JSX.Element {
  // This state variable holds a representation of the sudoku board as an array of 9x9 cells
  const [sudokuBoard, setSudokuBoard] = useState(generateSudokuBoard());

  // This state variable holds a pair of [row, col] coordinates that represent the current focused cell
  const [focusedCell, setFocusedCell] = useState([-1, -1]);

  // An array of array of refs. Each ref holds a reference to the actual input element that represents a cell
  // This is used to focus the current selected cell when using the arrow keys in the `handleKeyDown` event handler
  const cellRefs = useRef<React.RefObject<HTMLInputElement>[][]>(generateSudokuCellRefs());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const inputVal = parseInt(e.target.value);

    if (isValidValue(inputVal, row, col, sudokuBoard)) {
      const valuesCopy = sudokuBoard.slice();

      valuesCopy[row][col] = inputVal;

      setSudokuBoard(valuesCopy);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    const [row, col] = focusedCell;
    const aboveRow = clamp(row - 1, 0, sudokuBoard.length - 1);
    const belowRow = clamp(row + 1, 0, sudokuBoard.length - 1);
    const prevCol = clamp(col - 1, 0, sudokuBoard.length - 1);
    const nextCol = clamp(col + 1, 0, sudokuBoard.length - 1);

    switch (key) {
      case 'ArrowUp':
        cellRefs.current[aboveRow][col].current?.focus();
        break;
      case 'ArrowDown':
        cellRefs.current[belowRow][col].current?.focus();
        break;
      case 'ArrowLeft':
        cellRefs.current[row][prevCol].current?.focus();
        break;
      case 'ArrowRight':
        cellRefs.current[row][nextCol].current?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <Wrapper>
      {sudokuBoard.map((boardRow, i) => {
        return boardRow.map((cellValue, j) => {
          return (
            <SudokuCell
              ref={cellRefs.current[i][j]}
              key={i + j}
              row={i}
              col={j}
              value={cellValue}
              onChange={(e) => {
                handleChange(e, i, j);
              }}
              onFocus={setFocusedCell}
              isHighlighted={
                isCellInRow(focusedCell[0], i) ||
                isCellInCol(focusedCell[1], j) ||
                isCellInBox(focusedCell[0], focusedCell[1], i, j)
              }
              onKeyDown={handleKeyDown}
            />
          );
        });
      })}
    </Wrapper>
  );
}

export default SudokuBoard;