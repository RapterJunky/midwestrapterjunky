import { ImageIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormLabel } from "datocms-react-ui";
import { useForm } from "react-hook-form";
import { useSlate } from "slate-react";
import { Transforms } from "slate";
import Spinner from "@/components/ui/Spinner";
import { useState } from "react";

const ImageDialog: React.FC = () => {
    const [open, setOpen] = useState(false);
    const editor = useSlate();
    const form = useForm<{ url?: string; file?: { fileName: string | undefined, file: File | null } }>({
        defaultValues: {
            url: "",
            file: {
                file: null,
                fileName: ""
            }
        }
    });

    const urlhasValue = form.watch("url");
    const fileHasValue = form.watch("file.file");

    const onSubmit = async () => {
        try {
            const ok = await form.trigger(undefined, { shouldFocus: true });
            if (!ok) return;

            const { file, url } = form.getValues();

            const upload = await new Promise<{ image: HTMLImageElement, file: File | null }>((ok, rej) => {
                const fileObj = file?.file ?? null;

                if (url && !fileObj) {
                    const image = new Image();
                    image.addEventListener("load", () => {
                        ok({ image, file: fileObj });
                    }, false);
                    image.addEventListener("error", (ev) => {
                        console.error(ev);
                        rej(new Error("Failed to load image", { cause: "url" }));
                    });

                    image.src = url;
                    return;
                }

                if (!fileObj) return rej("Unable to load image");

                if (fileObj.size > 5_000_000) {
                    return rej(new Error("File size is grater then 5MB", { cause: "file" }));
                }

                const reader = new FileReader();

                reader.addEventListener("load", () => {
                    const dataUrl = reader.result;
                    if (!dataUrl || typeof dataUrl !== "string") {
                        return rej("Failed to load image");
                    }
                    const image = new Image();
                    image.addEventListener("load", () => {
                        ok({ image, file: fileObj });
                    }, false);
                    image.addEventListener("error", (ev) => {
                        console.error(ev);
                        rej(new Error("Failed to load image", { cause: "url" }));
                    });

                    image.src = dataUrl;
                }, false);

                reader.addEventListener("error", (ev) => {
                    console.error(ev);
                    rej(new Error("Failed to read image", { cause: "file" }));
                });

                reader.readAsDataURL(fileObj);
            });

            Transforms.insertNodes(editor, {
                type: "block",
                blockModelId: "ImageRecord",
                id: crypto.randomUUID(),
                width: upload.image.width,
                height: upload.image.height,
                file: upload.file,
                src: upload.image.src,
                children: [{ text: "" }],
            });

            setOpen(false);

            form.resetField("url");
            form.resetField("file", { keepDirty: false, keepError: false });
        } catch (error) {
            form.setError((error as Error)?.cause as "file" | "url" ?? "file", {
                message: (error as Error).message ?? "There was an error loading the image",
                type: "value"
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" title="Add Image" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon">
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <div className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Add a image</DialogTitle>
                        </DialogHeader>
                        <div>
                            <FormField rules={{
                                required: {
                                    message: "A image url is required else upload a image",
                                    value: !fileHasValue
                                }
                            }} control={form.control} name="url" render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="image-url">Image Url</FormLabel>
                                    <FormControl>
                                        <Input required={!fileHasValue} disabled={!!fileHasValue} {...field} name="url" accept="image/*" placeholder="Image url" type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex my-8 items-center justify-center">
                                <Separator className="w-1/3" />
                                <span className="px-4">Or</span>
                                <Separator className="w-1/3" />
                            </div>

                            <FormField rules={{
                                required: {
                                    message: "Upload a image or use a image url",
                                    value: !urlhasValue
                                }
                            }} name="file" control={form.control} render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel htmlFor="image-file">Upload Image</FormLabel>
                                    <FormControl>
                                        {/** 
                                         * to get react to stop throwing errors about controlled inputs
                                         * we can pass undefined to value prop, this removes that error 
                                         * and seems to not affect the input filelist.
                                         * 
                                         * @see https://claritydev.net/blog/react-hook-form-multipart-form-data-file-uploads
                                        */}
                                        <Input required={!urlhasValue} value={value?.fileName} disabled={!!urlhasValue} {...field} onChange={(e) => {
                                            onChange({ file: e.target.files?.item(0), fileName: undefined });
                                        }} name="file" accept="image/*" type="file" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <DialogFooter>
                            <Button disabled={form.formState.isSubmitting} variant="secondary" onClick={() => {
                                form.resetField("file", { keepDirty: false, keepError: false });
                                form.resetField("url");
                            }} type="button" className="mr-auto">Clear</Button>
                            <Button disabled={form.formState.isSubmitting} onClick={onSubmit} type="button">
                                {form.formState.isSubmitting ? (<Spinner className="mr-2 h-6 w-6" />) : null}
                                Add
                            </Button>
                        </DialogFooter>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default ImageDialog;