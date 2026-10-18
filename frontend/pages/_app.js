import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-sans: ${inter.style.fontFamily}, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
