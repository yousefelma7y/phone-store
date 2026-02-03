import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "POS System",
  description: "Manage Your Brand",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
    // other: [
    //   {
    //     rel: "icon",
    //     type: "image/png",
    //     url: "/logo-16x16.jpg",
    //     sizes: "16x16",
    //   },
    //   {
    //     rel: "icon",
    //     type: "image/png",
    //     url: "/logo-32x32.jpg",
    //     sizes: "32x32",
    //   },
    // ],
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
