import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";

export default function PlayerPage() {
  const [videos, setVideos] = useState<string[]>([]);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data: string[] = await res.json();
      setVideos(data);
    } catch {
      // silently retry on next poll
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 30_000);
    return () => clearInterval(interval);
  }, []);

  return <VideoPlayer videos={videos} />;
}
