import getCatalogSearch from "@/lib/services/shop/getCatalogSearch";
import ShopCard from "@/components/pages/shop/ShopCard";
import CatalogPagination from "./CatalogPagination";

const Catalog: React.FC<{ query: URLSearchParams }> = async ({ query }) => {
  const cursor = query.get("cursor")?.toString();
  const search = query.get("query")?.toString();

  const decodedCursor = cursor ? decodeURIComponent(cursor) : undefined;

  const { pageInfo, nodes } = await getCatalogSearch({
    query: query.get("query")?.toString(),
    sort: query.get("sort")?.toString(),
    vendor: query.get("vendor")?.toString(),
    cursor: decodedCursor,
    category: query.get("category")?.toString(),
  });

  return (
    <>
      {nodes.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((item, i) => (
            <ShopCard key={i} item={item} />
          ))}
        </div>
      ) : (
        <div className="my-12 flex justify-center transition duration-75 ease-in">
          <span className="animate-in fade-in">
            {search ? (
              <>
                There are no products that match &quot;
                <strong>{search}</strong>&quot;
              </>
            ) : (
              "There are no products to display."
            )}
          </span>
        </div>
      )}
      <div className="mt-10 flex w-full justify-center">
        <ul className="list-style-none flex space-x-4">
          <CatalogPagination query={query} nextCursor={pageInfo.nextCursor} />
        </ul>
      </div>
    </>
  );
};

export default Catalog;
