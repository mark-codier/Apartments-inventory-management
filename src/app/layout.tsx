// app/layout.tsx
import "./globals.css";
import Navbar from '../Components/Navbar'
import { ReactNode } from "react";

export const metadata = {
  title: "Inventarverwaltung",
  description: "Verwaltung des Inventars für Apartments und Lager",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Navbar />
        <div className="max-w-4xl mx-auto">{children}</div>
      </body>
    </html>
  );
}
