import ClientSideLayout from './ClientLayout';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientSideLayout>
        <main className="flex-1 overflow-y-auto bg-muted/5">
          {children}
        </main>
      </ClientSideLayout>
    </>
  );
}