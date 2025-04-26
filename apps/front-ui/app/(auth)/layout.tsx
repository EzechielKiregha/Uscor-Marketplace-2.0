import "../globals.css";
// import Providers from "@/components/Providers";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata()

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="relative flex flex-col min-h-screen" >
        {/* <Providers> */}
        <div className="flex-grow flex justify-center items-center">{children}</div>
        {/* </Providers> */}
      </main>
    </>
  );
}
