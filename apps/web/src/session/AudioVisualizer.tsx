import { useEffect, useRef } from 'react';

/** Canvas frequency-bar visualizer driven by the live AnalyserNode. */
export function AudioVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cctx = canvas?.getContext('2d');
    if (!canvas || !cctx) return;

    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf = 0;

    const draw = (): void => {
      raf = requestAnimationFrame(draw);
      const { width: w, height: h } = canvas;
      cctx.clearRect(0, 0, w, h);

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        const bars = 40;
        const step = Math.max(1, Math.floor(data.length / bars));
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[i * step]! / 255;
          const bh = Math.max(3, v * h);
          cctx.fillStyle = `rgba(96,165,250,${0.35 + v * 0.65})`;
          cctx.fillRect(i * bw + 1.5, (h - bh) / 2, bw - 3, bh);
        }
      } else {
        cctx.fillStyle = 'rgba(255,255,255,0.07)';
        cctx.fillRect(0, h / 2 - 1, w, 2);
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} width={520} height={96} className="h-24 w-full rounded-xl" />;
}
