import CatalogTabs from "./_components/catalog-tabs";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-4 text-slate-100 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Catalog</h1>
      <CatalogTabs />
      {children}
    </div>
  );
}