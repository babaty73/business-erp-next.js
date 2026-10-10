import "./globals.css";

export const metadata = {
  title: "BizManager | Business ERP",
  description: "Business management dashboard",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
