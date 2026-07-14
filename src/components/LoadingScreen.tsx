import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    import("ldrs").then((m) => {
      m.hourglass.register();
      setRegistered(true);
    });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-primary">
      {registered ? (
        <l-hourglass
          size="40"
          bg-opacity="0.1"
          speed="1.75"
          color="currentColor"
        />
      ) : (
        // Simple fallback while register finishes in 1-2ms
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" />
      )}
    </div>
  );
}
