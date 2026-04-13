
import WorkerLayout from './WorkerLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerLayout>
      <main className="flex-1 overflow-y-auto bg-muted/5">
          {children}
        </main>
    </WorkerLayout>
  );
}