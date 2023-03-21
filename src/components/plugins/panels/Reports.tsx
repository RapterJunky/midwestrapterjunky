import {
    Dropdown,
    DropdownMenu,
    DropdownGroup,
    TextInput,
    DropdownOption,
    Button,
} from "datocms-react-ui";
import {
    FaSearch,
    FaChevronUp,
    FaChevronDown,
} from "react-icons/fa";
import { Panel } from "./Panel";

const ArticleReport: React.FC<{ article: { slug: string; name: string; }, reason: string; created: string, owner: { image: string; name: string; }; reporter: { image: string; name: string; } }> = ({ article, reason, created, owner, reporter }) => {
    return (
        <li className="shadow p-4 bg-white">
            <h2 className="text-lg font-bold line-clamp-1">{reason}</h2>
            <span className="text-sm">Reported: {new Date(created).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long" })}</span>
            <hr />
            <details>
                <summary className="py-1 cursor-pointer">View Report</summary>
                <h4 className="font-bold">Type: Article</h4>
                <h4 className="font-bold">Reason:</h4>
                <p className="line-clamp-1 p-1 text-sm">{reason}</p>
                <h4 className="font-bold">Link to Article:</h4>
                <a className="text-blue-400 underline ml-4" href={article.slug}>{article.name}</a>
                <h4 className="font-bold">Owner:</h4>
                <div className="ml-4">
                    <img className="h-8 w-8" src={owner.image} />
                    <span className="text-sm">{owner.name}</span>
                </div>
                <h4 className="font-bold">Reported By:</h4>
                <div className="ml-4">
                    <img className="h-8 w-8" src={reporter.image} />
                    <span className="text-sm">{reporter.name}</span>
                </div>

                <div className="w-full flex justify-end">
                    <Dropdown renderTrigger={({ open, onClick }) => (
                        <Button onClick={onClick} buttonSize="xxs" buttonType="primary" rightIcon={open ? <FaChevronUp style={{ fill: "white" }} /> : <FaChevronDown style={{ fill: "white" }} />}>Actions</Button>
                    )}>
                        <DropdownMenu alignment="right">
                            <DropdownOption red>Remove Article and Ban User</DropdownOption>
                            <DropdownOption red>Remove Article</DropdownOption>
                            <DropdownOption red>Ban Reporty</DropdownOption>
                            <DropdownOption>Dismiss Report</DropdownOption>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </details>
        </li>
    );
}

const CommentReport: React.FC<{ comment: { content: { message: string; } }, reason: string; created: string, owner: { image: string; name: string; }; reporter: { image: string; name: string; } }> = ({ comment, reason, created, owner, reporter }) => {
    return (
        <li className="shadow p-4 bg-white">
            <h2 className="text-lg font-bold line-clamp-1">{reason}</h2>
            <span className="text-sm">Reported: {new Date(created).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long" })}</span>
            <hr />
            <details>
                <summary className="py-1 cursor-pointer">View Report</summary>
                <h4 className="font-bold">Type: Comment</h4>
                <h4 className="font-bold">Reason for report:</h4>
                <p className="p-1 text-sm">{reason}</p>
                <h4 className="font-bold">Offending Comment:</h4>
                <p className="p-1 text-sm w-1/2">{comment.content.message}</p>
                <h4 className="font-bold">Owner:</h4>
                <div className="ml-4">
                    <img className="h-8 w-8" src={owner.image} />
                    <span className="text-sm">{owner.name}</span>
                </div>
                <h4 className="font-bold">Reported By:</h4>
                <div className="ml-4">
                    <img className="h-8 w-8" src={reporter.image} />
                    <span className="text-sm">{reporter.name}</span>
                </div>

                <div className="w-full flex justify-end">
                    <Dropdown renderTrigger={({ open, onClick }) => (
                        <Button onClick={onClick} buttonSize="xxs" buttonType="primary" rightIcon={open ? <FaChevronUp style={{ fill: "white" }} /> : <FaChevronDown style={{ fill: "white" }} />}>Actions</Button>
                    )}>
                        <DropdownMenu alignment="right">
                            <DropdownOption red>Remove Article and Ban User</DropdownOption>
                            <DropdownOption red>Remove Article</DropdownOption>
                            <DropdownOption red>Ban Reporty</DropdownOption>
                            <DropdownOption>Hide Article</DropdownOption>
                            <DropdownOption>Dismiss Report</DropdownOption>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </details>
        </li>
    );
}

export const Reports: React.FC<{ mini: boolean, setMini: React.Dispatch<React.SetStateAction<boolean>> }> = ({ mini, setMini }) => {
    return (
        <Panel
            actions={<>
                <div className="flex mr-dato-m">
                    <TextInput id="search" name="search" placeholder="Search" />
                    <Button leftIcon={<FaSearch />} />
                </div>
                <Dropdown renderTrigger={({ open, onClick }) => (
                    <Button buttonType='primary' buttonSize="m" rightIcon={open ? <FaChevronUp style={{ fill: "white" }} /> : <FaChevronDown style={{ fill: "white" }} />} onClick={onClick}>Sort By: Newest</Button>
                )}>
                    <DropdownMenu alignment="right">
                        <DropdownGroup name="Date">
                            <DropdownOption>Newest</DropdownOption>
                            <DropdownOption>Oldest</DropdownOption>
                        </DropdownGroup>
                        <DropdownGroup name="Type">
                            <DropdownOption>Comment</DropdownOption>
                            <DropdownOption>Post</DropdownOption>
                        </DropdownGroup>
                    </DropdownMenu>
                </Dropdown>
            </>}
            title="Reports"
            mini={mini}
            setMini={() => setMini((state) => !state)}
        >
            <ul className="space-y-2 p-4 w-full">
                {Array.from({ length: 30 }).map((_, i) => i % 2 ? (
                    <ArticleReport article={{ slug: "#", name: "Some Article" }} reason=" Lorem ipsum dolor sit amet consectetur adipisicing elit." created={new Date().toISOString()} owner={{ image: "https://api.dicebear.com/5.x/initials/svg?seed=ON", name: "Owner Name" }} reporter={{ image: "https://api.dicebear.com/5.x/initials/svg?seed=RN", name: "Reporter Name" }} />
                ) : (
                    <CommentReport comment={{ content: { message: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Minus corrupti ratione dolorem ab voluptatibus libero atque cumque, voluptatum exercitationem molestias quia rem dolore voluptates nulla architecto nihil vel eligendi veniam?" } }} reason="Lorem ipsum dolor sit amet." created={new Date().toISOString()} owner={{ image: "https://api.dicebear.com/5.x/initials/svg?seed=ON", name: "Owner Name" }} reporter={{ image: "https://api.dicebear.com/5.x/initials/svg?seed=RN", name: "Reporter Name" }} />
                ))}
            </ul>
        </Panel>
    );
}