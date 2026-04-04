import { createAdminClient } from "@/lib/supabase/admin";

export default async function ExamplePaintings() {
  const supabase = createAdminClient();

  const { data: examples } = await supabase
    .from("example_paintings")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!examples || examples.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
          Example work
        </h2>
        <p className="text-[#6B6B6B]">
          A taste of what a few words can become.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-[#F0F0EE]">
              <img
                src={item.image_url}
                alt={item.note || "Example painting"}
                className="w-full h-full object-cover"
              />
            </div>
            {item.note && (
              <div className="p-4">
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  {item.note}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
