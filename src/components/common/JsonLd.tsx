export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // JSON.stringify output is safe; escape "<" to avoid closing the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
