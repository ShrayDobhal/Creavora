import MessagesPage from "@/app/(fan)/messages/page";

export default async function StudioMessagesPage({ searchParams }) {
  const params = await searchParams;
  const initialParticipantId = typeof params?.userId === "string" ? params.userId : null;
  return <MessagesPage initialParticipantId={initialParticipantId} />;
}
