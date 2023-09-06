import getVenders from "@/lib/services/shop/getVenders";
import SearchSettingsList from "./SearchSettingsList";

const Vendors: React.FC = async () => {

    const vendors = await getVenders();

    return (
        <SearchSettingsList items={vendors} name="All Vendors" queryKey="vendor" />
    );
}

export default Vendors;