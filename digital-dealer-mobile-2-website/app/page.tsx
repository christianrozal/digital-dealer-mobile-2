"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onPress={() => router.push("/dealership/lennock-volkswagen/signup")}>
        Go to Lennock Volkswagen Signup
      </Button>
    </div>
  );
}