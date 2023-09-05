import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const TopicEditor: React.FC = () => {
    return (
        <>
            <Separator />
            <div className="h-full flex-col md:flex">
                <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                    <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Topic Editor</h2>
                </div>
                <div className="flex-1">
                    <div className="container h-full py-6">
                        <div className="grid h-full grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_200px]">
                            <div className="md:order-1">
                                <div className="flex h-full flex-col space-y-4">
                                    <Textarea className="min-h-[400px] flex-1 p-4 md:min-h-[700px]" />
                                    <div className="flex items-center space-x-2">
                                        <Button>Submit</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-col space-y-4 sm:flex order-first md:order-2">
                                <Label>Title</Label>
                                <Input placeholder="title" />
                                <Label>Category</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TopicEditor;