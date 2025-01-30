"use client";

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditButton({ entryId } : any) {
    const router = useRouter();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/story/write?edit=${entryId}`)}
        >
            <Edit className="h-4 w-4 mr-2" />
            Edit
        </Button>
    );
}