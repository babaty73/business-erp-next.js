import "./globals.css";

export const metadata = {
  title: "Business ERP",
  description: "Business management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
