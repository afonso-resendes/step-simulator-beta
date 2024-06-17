import '@/src/app/global.css'

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{overflow: 'hidden'}}>{children}</body>
    </html>
  );
}
