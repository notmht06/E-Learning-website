import { BookDetailClient } from './BookDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  return <BookDetailClient bookId={id} />;
}

