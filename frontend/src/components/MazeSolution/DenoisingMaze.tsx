import { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { TMaze, TPoint } from '../MazeGenerator/Utils';

type DenoisingMazeProps = {
  maze: TMaze;
  solution: TPoint[];
  start: TPoint;
  end: TPoint;
  isDenoising: boolean;
  denoisingStep: number | null;
  denoisingTotal: number | null;
};

const pointKey = (x: number, y: number) => `${x},${y}`;

const cellClass =
  'w-2 h-2 min-[480px]:w-3 min-[480px]:h-3 md:w-4 md:h-4 text-center relative';

const DenoisingMaze = ({
  maze,
  solution,
  start,
  end,
  isDenoising,
  denoisingStep,
  denoisingTotal,
}: DenoisingMazeProps) => {
  const prevSolutionRef = useRef<Set<string>>(new Set());
  const [ghostCells, setGhostCells] = useState<Set<string>>(new Set());
  const [newCells, setNewCells] = useState<Set<string>>(new Set());

  const solutionSet = useMemo(
    () => new Set(solution.map((p) => pointKey(p.x, p.y))),
    [solution]
  );

  const progress =
    denoisingStep && denoisingTotal ? denoisingStep / denoisingTotal : 1;

  useEffect(() => {
    const current = solutionSet;
    const prev = prevSolutionRef.current;

    const added = [...current].filter((key) => !prev.has(key));
    const removed = [...prev].filter((key) => !current.has(key));

    const timers: number[] = [];

    if (added.length > 0) {
      setNewCells(new Set(added));
      timers.push(window.setTimeout(() => setNewCells(new Set()), 500));
    }

    if (removed.length > 0) {
      setGhostCells(new Set(removed));
      timers.push(window.setTimeout(() => setGhostCells(new Set()), 450));
    }

    prevSolutionRef.current = current;

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [solutionSet, denoisingStep]);

  useEffect(() => {
    if (!isDenoising) {
      setGhostCells(new Set());
      setNewCells(new Set());
      prevSolutionRef.current = solutionSet;
    }
  }, [isDenoising, solutionSet]);

  const getSolutionCellStyle = (key: string) => {
    if (ghostCells.has(key)) {
      return 'denoise-ghost bg-green-200/50';
    }

    if (newCells.has(key)) {
      return 'denoise-birth bg-green-300 shadow-[0_0_6px_rgba(134,239,172,0.8)]';
    }

    if (!isDenoising) {
      return 'denoise-settled bg-green-400';
    }

    if (progress < 0.5) {
      return 'denoise-forming bg-green-200/70';
    }

    return 'denoise-crystallize bg-green-300';
  };

  return (
    <div className="relative">
      <div
        className={cx(
          'relative overflow-hidden border-2 w-fit',
          isDenoising && 'denoise-grain'
        )}
      >
        {isDenoising && (
          <div
            className="denoise-scanline pointer-events-none absolute inset-0 z-10 opacity-20"
            aria-hidden
          />
        )}

        <div className="relative z-0 flex">
          {maze.map((mazeRow, i) => (
            <div key={i} className="flex flex-col">
              {mazeRow.map((mazeCell, j) => {
                const key = pointKey(i, j);

                if (i === start.x && j === start.y) {
                  return (
                    <span
                      key={key}
                      title="start"
                      className={cx(cellClass, 'bg-blue-400')}
                    />
                  );
                }

                if (i === end.x && j === end.y) {
                  return (
                    <span
                      key={key}
                      title="end"
                      className={cx(cellClass, 'bg-red-400')}
                    />
                  );
                }

                if (solutionSet.has(key) || ghostCells.has(key)) {
                  return (
                    <div
                      key={key}
                      className={cx(cellClass, getSolutionCellStyle(key))}
                    />
                  );
                }

                if (mazeCell === 1) {
                  return (
                    <div
                      key={key}
                      className={cx(
                        cellClass,
                        isDenoising ? 'bg-gray-100' : 'bg-gray-100'
                      )}
                    />
                  );
                }

                return (
                  <div
                    key={key}
                    className={cx(
                      cellClass,
                      'border-black bg-black',
                      {
                        'border-t':
                          j === 0 || (j - 1 >= 0 && maze[i][j - 1] === 1),
                        'border-r': i + 1 < maze.length && maze[i + 1][j] === 1,
                        'border-l': !!(i - 1 >= 0 && maze[i - 1][j] == 1),
                        'border-b':
                          j + 1 < maze[i].length && maze[i][j + 1] == 1,
                      }
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DenoisingMaze;
