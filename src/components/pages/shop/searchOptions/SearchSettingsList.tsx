import SearchOption from "./SearchOption";
import SearchOptionsSelect from "./SearchOptionsSelect";
import Link from "next/link";
import { SelectItem } from "@/components/ui/select";

type SearchSettingsListProps = {
  name: string;
  queryKey: string;
  items: { name: string; value: string }[];
};

const SearchSettingsList: React.FC<SearchSettingsListProps> = ({
  queryKey,
  items,
  name,
}) => {
  return (
    <div className="relative inline-block w-full">
      <div className="mt-3 lg:hidden">
        <SearchOptionsSelect queryKey={queryKey} name={name}>
          <SelectItem value="DEFAULT">{name}</SelectItem>
          {items.map((item, i) => (
            <SelectItem key={i} value={item.value}>
              {item.name}
            </SelectItem>
          ))}
        </SearchOptionsSelect>
      </div>
      <div className="absolute left-0 z-10 mb-10 mt-2 hidden w-full origin-top-left rounded-md shadow-lg lg:relative lg:block lg:shadow-none">
        <div className="shadow-xs rounded-sm bg-white lg:bg-none lg:shadow-none">
          <div>
            <ul>
              <li
                className={`hover:bg-accent-1 hover:text-accent-8 focus:bg-accent-1 focus:text-accent-8 block text-sm leading-5 text-zinc-600 focus:outline-none lg:text-base lg:font-bold lg:tracking-wide lg:no-underline lg:hover:bg-transparent`}
              >
                <Link
                  className="block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0"
                  href="/shop"
                >
                  {name}
                </Link>
              </li>
              {items.map((item, i) => (
                <SearchOption
                  queryKey={queryKey}
                  name={item.name}
                  value={item.value}
                  key={i}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSettingsList;
