import { Button } from "datocms-react-ui";
import type { Paginate } from "@type/page";

type Props = {
    setPage: (page: number) => void,
    data: Paginate<object>
}

const DatoCmsPagination: React.FC<Props> = ({ setPage, data }) => {
    return (
        <div className="my-dato-l flex items-center justify-evenly">
            <Button
                onClick={() => setPage(data?.previousPage ?? 1)}
                disabled={data?.isFirstPage}
                type="button"
                buttonType="primary"
            >
                Prev
            </Button>

            <div>
                Page {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
            </div>

            <Button
                onClick={() => setPage(data?.nextPage ?? 1)}
                disabled={data?.isLastPage}
                type="button"
                buttonType="primary"
            >
                Next
            </Button>
        </div>
    );
}

export default DatoCmsPagination;