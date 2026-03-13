import "./globals.css";

export const metadata = {
  title: "PRIMECHANGE Executive Dashboard",
  description: "Executive dashboard for PRIMECHANGE hotel cleaning operations."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
