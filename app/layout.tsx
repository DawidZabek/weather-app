import "./globals.css";

export const metadata = {
  title: "Weather App",
  description: "Server-side weather app with Next.js and Open-Meteo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
