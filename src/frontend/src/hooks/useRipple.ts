import { useCallback } from "react";

export function useRipple() {
  const ripple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const rippleEl = document.createElement("span");
    rippleEl.className = "ripple-wave";
    rippleEl.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
    btn.appendChild(rippleEl);
    setTimeout(() => rippleEl.remove(), 600);
    if (navigator.vibrate) navigator.vibrate(8);
  }, []);
  return ripple;
}
