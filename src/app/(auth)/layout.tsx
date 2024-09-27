export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div
        className={`dark w-full h-full absolute flex items-center justify-center p-2`}>
        {children}
      </div>
    );
  }