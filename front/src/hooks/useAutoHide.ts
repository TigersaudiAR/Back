import { useEffect, useState } from "react";

type AutoHideOptions = {
  delay?: number;
};

export function useAutoHide({ delay = 5000 }: AutoHideOptions = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => setVisible(false), delay);
    return () => clearTimeout(timeout);
  }, [visible, delay]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return { visible, show, hide, setVisible } as const;
}
