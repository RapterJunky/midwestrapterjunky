import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertLink } from "@/lib/utils/editor/textEditorUtils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSlate } from "slate-react";

const CommentLinkDialog: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const editor = useSlate();
    const form = useForm<{ link: string }>({
        defaultValues: {
            link: ""
        }
    });

    const onSubmit = async () => {
        const vaild = await form.trigger();
        if (!vaild) return;

        const value = form.getValues("link");

        try {
            const link = new URL(value);
            if (!link.protocol.includes("https")) throw new Error("Link must start with https://");
            if (link.hostname.endsWith(".zip")) {
                throw new Error(".zip domain is not a vaild host");
            }
        } catch (error) {
            form.setError("link", {
                message: (error as Error)?.message ?? "URL is invaild",
                type: "validate"
            });
            return;
        }

        insertLink(editor, value);

        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Link</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <FormField rules={{
                        required: {
                            message: "Please enter a link",
                            value: true
                        }
                    }} control={form.control} name="link" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                                <Input {...field} name="link" required type="url" placeholder="https://midwestraptorjunkies.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </Form>
                <DialogFooter>
                    <Button type="button" onClick={onSubmit}>
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CommentLinkDialog;