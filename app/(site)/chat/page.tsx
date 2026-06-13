"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/projects#chat");
  }, [router]);

  return null;
}
