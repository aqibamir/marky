interface QuestionMediaProps {
  imageUrls?: string[];
  videoUrls?: string[];
}

export default function QuestionMedia({ imageUrls, videoUrls }: QuestionMediaProps) {
  if (!imageUrls?.length && !videoUrls?.length) return null;

  return (
    <div className="mb-3 space-y-2">
      {videoUrls?.map((src) => (
        <video
          key={src}
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-xl border border-border bg-black"
        >
          <source src={src} />
        </video>
      ))}
      {imageUrls?.map((src) => (
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
