import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanwo + Next.js Example",
  description: "Accept payments with Sanwo in a Next.js app — supports all 8 providers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
