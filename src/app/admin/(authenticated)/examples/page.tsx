import { createClient } from "@/lib/supabase/server";
import ExampleUpload from "./example-upload";
import ExampleCard from "./example-card";

export default async function AdminExamplesPage() {
  const supabase = await createClient();

  const { data: examples } = await supabase
    .from("example_paintings")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Example Paintings</h1>
        <p className="text-sm text-[#6B6B6B]">
          These show on the gallery page as examples of your work. Upload up to 9.
        </p>
      </div>

      {/* Upload */}
      {(!examples || examples.length < 9) && <ExampleUpload />}

      {/* Grid */}
      {examples && examples.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {examples.map((ex) => (
            <ExampleCard
              key={ex.id}
              id={ex.id}
              imageUrl={ex.image_url}
              note={ex.note}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[#999]">
          No example paintings yet. Upload your first one above.
        </div>
      )}
    </div>
  );
}
