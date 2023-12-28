"use client"

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { formatPrice } from "@/lib/format";

const formScehma = z.object({
    price: z.coerce.number(),
});

interface PriceFormProps {
    initialData: Course
    courseId: string
}

const PriceForm = ({
    initialData,
    courseId
}: PriceFormProps) => {



    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current)

    const form = useForm<z.infer<typeof formScehma>>({
        resolver: zodResolver(formScehma),
        defaultValues: {
            price: initialData?.price || undefined
        }
    })

    const router = useRouter();

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formScehma>) => {
        try {

            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Course updated");
            toggleEdit();
            router.refresh();


        } catch (error) {
            toast.error("Something went wrong")
            console.log(error)
        }
    }

    return (
        <div className=" mt-6 border bg-slate-100 rounded-md p-4">
            <div className=" font-medium flex items-center justify-between">
                Course price
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className=" h-4 w-4 mr-2" />
                            Edit price
                        </>
                    )}

                </Button>
            </div>
            {!isEditing ? (
                <p className={cn(
                    `text-sm mt-2`,
                    !initialData.price && "text-slate-500 italic"
                )}>
                    {initialData.price ? formatPrice(initialData.price) : "No price"}
                </p>
            ) : (
                <Form
                    {...form}
                >
                    <form 
                    className=" space-y-4 mt-4"
                    onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder="Set a price for your course"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className=" flex items-center gap-x-2">
                            <Button disabled={!isValid || isSubmitting}>
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
};

export default PriceForm;
