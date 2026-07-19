import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanwo + Next.js Example",
  description: "Accept payments with Sanwo and Paystack in a Next.js app",
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
