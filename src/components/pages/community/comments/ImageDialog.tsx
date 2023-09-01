import { Image } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { FormLabel } from "datocms-react-ui";

const ImageDialog: React.FC = () => {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" title="Add Image" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon">
                    <Image className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form>
                    <div id="image-add" className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Add a image</DialogTitle>
                        </DialogHeader>
                        <div>

                            <FormItem>
                                <FormLabel htmlFor="image-url">Image Url</FormLabel>
                                <FormControl>
                                    <Input id="image-url" name="url" accept="image/*" placeholder="Image url" type="text" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <div>
                                <Label>Image url</Label>
                            </div>
                            <div className="flex my-8 items-center justify-center">
                                <Separator className="w-1/3" />
                                <span className="px-4">Or</span>
                                <Separator className="w-1/3" />
                            </div>

                            <FormItem>
                                <FormLabel htmlFor="image-file">Upload Image</FormLabel>
                                <FormControl>
                                    <Input id="image-file" name="file" accept="image/*" type="file" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        </div>
                        <DialogFooter>
                            <Button form="image-add" type="submit">Add</Button>
                        </DialogFooter>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default ImageDialog;