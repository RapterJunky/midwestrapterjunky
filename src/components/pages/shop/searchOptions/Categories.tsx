import getCategories from "@/lib/services/shop/getCategories";
import SearchSettingsList from "./SearchSettingsList";

const Categories: React.FC = async () => {
  const categories = await getCategories();

  return (
    <SearchSettingsList
      queryKey="category"
      items={categories.map((value) => ({
        name: value.name,
        value: value.id,
        query: "category",
      }))}
      name="All Categories"
    />
  );
};

export default Categories;
