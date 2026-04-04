const examples = [
  {
    image: "/examples/example-1.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-2.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-3.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-4.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-5.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-6.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-7.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-8.jpg",
    note: "Add a note about this painting",
  },
  {
    image: "/examples/example-9.jpg",
    note: "Add a note about this painting",
  },
];

export default function ExamplePaintings() {
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
        {examples.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-[#F0F0EE]">
              <img
                src={item.image}
                alt={item.note}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
