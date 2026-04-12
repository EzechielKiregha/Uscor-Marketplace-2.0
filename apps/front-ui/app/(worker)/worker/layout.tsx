import WorkerSideLayout from './WorkerLayout';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WorkerSideLayout>
        <main className="flex-1 overflow-y-auto bg-muted/5">
          {children}
        </main>
      </WorkerSideLayout>
    </>
  );
}