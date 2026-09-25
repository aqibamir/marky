interface QuestionMediaProps {
  imageUrls?: string[];
  videoUrls?: string[];
}

export default function QuestionMedia({ imageUrls, videoUrls }: QuestionMediaProps) {
  if (!imageUrls?.length && !videoUrls?.length) return null;

  const hasVideo = Boolean(videoUrls?.length);
  // When a question has both, the image is the video's own first frame -
  // use it as the <video> poster so something shows immediately instead of
  // a blank/black box while the clip itself is still loading, rather than
  // rendering it a second time as a separate image underneath.
  const poster = hasVideo ? imageUrls?.[0] : undefined;
  const standaloneImages = hasVideo ? imageUrls?.slice(1) : imageUrls;

  return (
    <div className="mb-3 space-y-2">
      {videoUrls?.map((src) => (
        <video
          key={src}
          controls
          playsInline
          preload="metadata"
          poster={poster}
          className="w-full rounded-xl border border-border bg-black"
        >
          <source src={src} />
        </video>
      ))}
      {standaloneImages?.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt="Question illustration"
          loading="lazy"
          className="w-full rounded-xl border border-border object-cover"
        />
      ))}
    </div>
  );
}
