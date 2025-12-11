import { headers } from "next/headers";
import { ProfilerUI } from "@/module/profiler/component/profiler-ui";

export default async function Page() {
  const headersList = await headers();

  const protocal = headersList.get("x-forwarded-proto");
  const host = headersList.get("x-forwarded-host");

  async function chat(
    message: string,
    speed: number,
  ): Promise<{ text: string; audioBase64: string | null }> {
    "use server";

    const apiUrl = `${protocal}://${host}/api/profiler`;
    console.debug({
      apiUrl,
      message,
      speed,
    });

    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        message,
        speed,
      }),
    });

    const data = await res.json();

    return data;
  }

  return <ProfilerUI onSubmit={chat} />;
}
