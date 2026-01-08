export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Headache Awareness Trainer
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Learn to listen to your body before the headache speaks
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-sm text-muted-foreground">
            This app helps you build awareness of your headache patterns and body signals.
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Project initialized successfully</p>
          <p className="mt-1">Ready for development</p>
        </div>
      </div>
    </main>
  );
}
