import React, { useState, useEffect } from 'react';
import BaseWidget from '../../templates/BaseWidget';
import { WidgetProps } from '../../index';

const PomodoroTimer: React.FC<WidgetProps> = ({ width, height, theme }) => {
  const [time, setTime] = useState<number>(1500); // 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isWorkSession, setIsWorkSession] = useState<boolean>(true);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0) {
      clearInterval(interval);
      setTimeout(() => {
        const nextIsWorkSession = !isWorkSession;
        setIsWorkSession(nextIsWorkSession);
        if (nextIsWorkSession) {
          setTime(1500); // 25 minutes work
        } else {
          setTime(sessionCount >= 4 ? 900 : 300); // 15 or 5 minutes break
        }
        setIsActive(true);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isWorkSession, sessionCount]);

  const toggleSession = () => {
    setTime(1500);
    setIsActive(true);
    setIsWorkSession(true);
    setSessionCount(0);
  };

  const startPauseHandler = () => {
    setIsActive(!isActive);
  };

  const resetHandler = () => {
    if (!isActive) {
      setIsWorkSession(true);
      setSessionCount(0);
      setTime(1500);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <BaseWidget title="Pomodoro Timer" width={300} height={200}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-4xl font-bold mb-6">
          {formatTime(time)}
        </div>
        <div className="text-xl mb-4">
          {isWorkSession ? 'Work Session ⏱️' : 'Break Time 🕒'}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={startPauseHandler}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="{isActive ? 'Pause' : 'Start'} Timer">
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetHandler}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            title="Reset Timer">
            Reset
          </button>
        </div>
        <div className="mt-6 text-center">
          {isWorkSession
            ? '25 minutes focused work, 5 minutes break'
            : 'Take a break, then work again'}
        </div>
        <div className="mt-2 text-sm">
          Cycles: {isWorkSession ? 0 : Math.floor(sessionCount / 2) + 1}
        </div>
      </div>
    </BaseWidget>
  );
};

export default PomodoroTimer;