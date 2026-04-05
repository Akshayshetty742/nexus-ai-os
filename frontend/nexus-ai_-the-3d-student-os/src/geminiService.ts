export async function mentorAgent(message: string) {
  const res = await fetch(
    "https://nexus-backend-66306220900.asia-south1.run.app/api/mentor",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  const data = await res.json();
  return data.reply;
}