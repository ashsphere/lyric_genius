import React from 'react';

type Props = {
  value: [number];
  onValueChange: (value: [number]) => void;
  max?: number;
  step?: number;
};

export const Slider: React.FC<Props> = ({ value, onValueChange, max = 100, step = 1 }) => {
  return (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      min={0}
      max={max}
      step={step}
      className="w-full"
    />
  );
};

