import SearchSettingsList from "./SearchSettingsList";
import getVenders from "@/lib/services/shop/getVenders";

const Vendors: React.FC = () => {
  const vendors = getVenders();

  return (
    <SearchSettingsList items={vendors} name="All Vendors" queryKey="vendor" />
  );
};

export default Vendors;
