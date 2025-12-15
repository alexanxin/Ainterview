import { notFound } from 'next/navigation';

// This page doesn't need to render anything as it's just for routing
// The actual job application page is under /apply/[jobPostId]/page.tsx
export default function ApplyPage() {
  // This page shouldn't be accessed directly
  notFound();
}