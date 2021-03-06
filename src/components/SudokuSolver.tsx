import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Board } from '../typings/Board';
import {
  generateEmptySudokuBoard,
  generateSolvableSudokuBoard,
  solveSudokuSteps,
} from '../util/sudoku';
import { deepCopy, sleep } from '../util/util';
import SudokuBoard from './SudokuBoard';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 10fr 4rem 4rem;
  gap: 2rem;
`;

const UnsolvableNotice = styled.p`
  margin: 0;
  font-size: 3rem;
  text-align: center;
  color: #f00;
`;

const SolvingSpeedWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const SolvingSpeedLabel = styled.label`
  font-size: 2rem;
`;

const SolvingSpeedInput = styled.input`
  width: 10rem;
  height: 75%;
  text-align: center;
  font-size: 2rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 5rem;
`;

const Button = styled.button`
  color: #fff;
  background-color: #267ef1;
  font-size: 1.8rem;
  width: 20%;
  border: none;
  border-radius: 5px;

  &:hover {
    background-color: #256cca;
    cursor: pointer;
  }

  &:disabled {
    background-color: #478fec;
    cursor: not-allowed;
  }
`;

function SudokuSolver(): JSX.Element {
  // This state variable holds a representation of the sudoku board as an array of 9x9 cells
  const [sudokuBoard, setSudokuBoard] = useState(generateEmptySudokuBoard());
  const [solvingSteps, setSolvingSteps] = useState<Board[]>([]);
  const [isUnsolvable, setIsUnsolvable] = useState(false);

  const [solvingSpeed, setSolvingSpeed] = useState('1');
  const [isSolvingSudoku, setIsSolvingSudoku] = useState(false);
  const currentStepIdx = useRef(0);

  useEffect(() => {
    const numericSolvingSpeed = parseInt(solvingSpeed);
    let skipPreviousEffect = false;

    async function showSteps() {
      if (numericSolvingSpeed === 0) {
        setSudokuBoard(solvingSteps[solvingSteps.length - 1]);
      } else {
        for (let i = currentStepIdx.current; i < solvingSteps.length; i++) {
          const step = solvingSteps[i];

          if (!skipPreviousEffect) {
            currentStepIdx.current = i;
            setSudokuBoard(step);
            await sleep(numericSolvingSpeed);
          }
        }
      }
    }

    if (isSolvingSudoku) {
      showSteps();
    }

    return () => {
      skipPreviousEffect = true;
    };
  }, [solvingSpeed, solvingSteps, isSolvingSudoku]);

  const resetState = () => {
    setIsSolvingSudoku(false);
    setSolvingSteps([]);
    setIsUnsolvable(false);
    currentStepIdx.current = 0;
  };

  const setSudokuCell = (value: number, row: number, col: number) => {
    const valuesCopy = deepCopy(sudokuBoard) as Board;

    valuesCopy[row][col].value = value;
    valuesCopy[row][col].isGiven = !!value;

    setSudokuBoard(valuesCopy);
  };

  const handleSolvingSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolvingSpeed(e.target.value);
  };

  const handleClearClick = () => {
    resetState();
    setSudokuBoard(generateEmptySudokuBoard());
  };

  const handleSolveClick = () => {
    setIsSolvingSudoku(true);
    const steps = solveSudokuSteps(deepCopy(sudokuBoard) as Board);
    if (steps) {
      setSolvingSteps(steps);
    } else {
      setIsUnsolvable(true);
    }
    currentStepIdx.current = 0;
  };

  const handleGenerateClick = () => {
    resetState();
    setSudokuBoard(generateSolvableSudokuBoard());
  };

  return (
    <Wrapper>
      <UnsolvableNotice>{isUnsolvable && 'Unsolvable board'}</UnsolvableNotice>
      <SudokuBoard
        board={sudokuBoard}
        setBoardCell={setSudokuCell}
        disableUserInput={isSolvingSudoku}
      />
      <SolvingSpeedWrapper>
        <SolvingSpeedLabel htmlFor="solving-speed-input">Solving speed (ms):</SolvingSpeedLabel>
        <SolvingSpeedInput
          id="solving-speed-input"
          type="number"
          min="0"
          max="3000"
          value={solvingSpeed}
          onChange={handleSolvingSpeedChange}
        />
      </SolvingSpeedWrapper>
      <ButtonWrapper>
        <Button type="button" onClick={handleClearClick}>
          Clear
        </Button>
        <Button type="button" onClick={handleSolveClick} disabled={isSolvingSudoku}>
          Solve
        </Button>
        <Button type="button" onClick={handleGenerateClick}>
          Generate
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}

export default SudokuSolver;
