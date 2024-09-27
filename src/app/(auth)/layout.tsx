export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body
          className={`dark w-full h-full absolute flex items-center justify-center p-2`}>
          {children}
        </body>
      </html>
    );
  }