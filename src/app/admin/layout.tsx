// Thin segment root — auth guard lives in (authenticated)/layout.tsx.
// The login page inherits only this wrapper, which adds nothing,
// so it can render its own full-screen UI without interference.
export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
