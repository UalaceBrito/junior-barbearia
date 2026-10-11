import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Junior Barbearia | Seu estilo, nossa tradição",
    template: "%s | Junior Barbearia",
  },
  description:
    "Agende seu próximo corte na Junior Barbearia. Atendimento cuidadoso, estilo e praticidade.",
  applicationName: "Junior Barbearia",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Junior Barbearia",
    title: "Junior Barbearia | Seu estilo, nossa tradição",
    description:
      "Agende seu próximo corte na Junior Barbearia. Atendimento cuidadoso, estilo e praticidade.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
