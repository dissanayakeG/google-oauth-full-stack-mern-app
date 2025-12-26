export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl"></div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="w-full h-10 bg-gray-200 border border-gray-300 rounded-md animate-pulse" />
        </div>
      </section>

      <main className="max-w-6xl mx-auto p-4 md:p-8 min-h-[60vh]">
        <div className="mb-6 flex justify-between items-end">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
                  </div>

                  <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse mt-1.5" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
