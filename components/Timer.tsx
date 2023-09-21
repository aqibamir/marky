"use client";

import React from "react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const defaultRemainingTime = {
  seconds: "00",
  minutes: "00",
};

interface TimerProps {
  countDownTime: number;
}

const Timer: React.FC<TimerProps> = ({ countDownTime }) => {
  const [time, setTime] = useState(defaultRemainingTime);

  // I need to set timer after every one second for that I need useEffect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(updateTime(countDownTime));
    }, 1000);

    return () => clearInterval(intervalId);
  });

  // Utility
  function padWithZeros(number: number, minLength: number) {
    const numberString = number.toString();
    if (numberString.length >= minLength) return numberString;
    return "0".repeat(minLength - numberString.length) + numberString;
  }

  // Function to update the timer
  const updateTime = (countDownTime: number) => {
    const timestampDayjs = dayjs(countDownTime);
    const nowDayjs = dayjs();
    if (timestampDayjs.isBefore(nowDayjs)) {
      return {
        seconds: "00",
        minutes: "00",
      };
    } else {
      var seconds = padWithZeros(
        timestampDayjs.diff(nowDayjs, "seconds") % 60,
        2
      );
      var minutes = padWithZeros(
        timestampDayjs.diff(nowDayjs, "minutes") % 60,
        2
      );

      return {
        seconds: seconds,
        minutes: minutes,
      };
    }
  };
  return (
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
      <div className="flex flex-col">
        <span className="font-mono text-5xl">
          <span>{time.minutes}</span>
        </span>
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span>{time.seconds}</span>
        </span>
      </div>
    </div>
  );
};

export default Timer;
