import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  videos: string[];
}

export default function VideoPlayer({ videos }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Reset index if it's out of bounds after playlist change
  useEffect(() => {
    if (videos.length > 0 && currentIndex >= videos.length) {
      setCurrentIndex(0);
    }
  }, [videos, currentIndex]);

  // When network comes back online, retry the current video
  useEffect(() => {
    const handleOnline = () => setRetryKey((k) => k + 1);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handleError = useCallback(() => {
    // Video failed to load (network down, server unreachable, etc.)
    // Retry after 5 seconds
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      setRetryKey((k) => k + 1);
    }, 5000);
  }, []);

  if (videos.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="text-2xl text-white/50">Бичлэг байхгүй байна</p>
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black"
      onDoubleClick={toggleFullscreen}
    >
      <video
        key={`${videos[currentIndex]}-${retryKey}`}
        className="h-full w-full object-cover"
        src={`/videos/${videos[currentIndex]}`}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}
