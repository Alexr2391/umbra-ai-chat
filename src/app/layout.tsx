import { SideNav } from "@/app/(ui)/components/SideNav/SideNav";
import { ConversationsProvider } from "@/app/(ui)/context/ConversationsContext";
import { getConversations } from "@/app/actions";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../styles/global.scss";
import styles from "./layout.module.scss";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Umbra chat",
  description: "Get umbra's wizardry to assist you in your tasks",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user ?? null;
  const conversations = user ? await getConversations() : [];

  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className={`${roboto.className} ${styles.body}`}>
        <ConversationsProvider initialConversations={conversations}>
          {user && <SideNav sessionData={user} />}
          <main className={styles.main}>{children}</main>
        </ConversationsProvider>
      </body>
    </html>
  );
}
