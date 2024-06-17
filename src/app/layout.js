import "@/src/app/global.css";

export const metadata = {
  title: "STEP - Simulator",
  description: "Create your art",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ overflow: "hidden" }}>{children}</body>
    </html>
  );
}
