import { ComponentPropsWithoutRef } from 'react';

export interface DotsProps extends ComponentPropsWithoutRef<'svg'> {
  size?: number;
  radius?: number;
  gap?: number;
  count?: number;
}

export function Dots({ size = 185, radius = 2.5, gap = 20, count = 10, ...others }: DotsProps) {
  const rects = [];
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      rects.push(
        <rect key={`${x}-${y}`} x={x * gap} y={y * gap} width='5' height='5' rx={radius} />,
      );
    }
  }

  return (
    <svg
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
      fill='currentColor'
      viewBox={`0 0 ${count * gap} ${count * gap}`}
      width={size}
      height={size}
      {...others}
    >
      {rects}
    </svg>
  );
}
