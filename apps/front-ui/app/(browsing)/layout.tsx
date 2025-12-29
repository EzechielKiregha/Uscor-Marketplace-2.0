import ClientSideLayout from './ClientLayout';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientSideLayout>
        <main className="flex-1 overflow-y-auto bg-background p-4">
          {children}
        </main>
      </ClientSideLayout>
    </>
  );
}