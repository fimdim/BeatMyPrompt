import { useEffect, useState } from 'react';

interface Props {
  from: number;
  onComplete: () => void;
}

export function Countdown({ from, onComplete }: Props) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="countdown">
      <span className="countdown-number" key={count}>
        {count > 0 ? count : 'GO!'}
      </span>
    </div>
  );
}
