import { Spinner } from "datocms-react-ui";
import type { Paginate } from "@type/page";

type Props = {
  data: Paginate<object | undefined> | undefined;
  error: Response | Error | undefined;
  isLoading: boolean;
  message: {
    error: string;
    empty: string;
  };
};

const DisplayDataStates: React.FC<Props> = ({
  data,
  error,
  isLoading,
  message,
}) => {
  if (!data && isLoading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size={56} />
      </div>
    );

  if (!data && error)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-lg">{message.error}</h1>
      </div>
    );

  if (data && !data.result.length)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-lg">{message.empty}</h1>
      </div>
    );

  return null;
};

export default DisplayDataStates;
