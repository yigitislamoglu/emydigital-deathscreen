import { memo, useEffect, useRef } from "react";

type BackgroundProps = {
  /** When false, the EKG video pauses to save CEF CPU. */
  active: boolean;
};

function Background({ active }: BackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <div className="deathscreen-bg" aria-hidden="true">
      <img src="./background.png" alt="" className="deathscreen-bg__layer" draggable={false} />
      <video
        ref={videoRef}
        src="./ekg-animation.webm"
        className="deathscreen-bg__video"
        autoPlay={active}
        loop
        muted
        playsInline
        preload="metadata"
      />
    </div>
  );
}

export default memo(Background);
