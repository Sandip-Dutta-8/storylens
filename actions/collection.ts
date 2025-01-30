'use server'

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


//create collection
export async function createCollection(data: any) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        //ArcJet rate limiting
        const req = await request();

        const decision = await aj.protect(req, {
            userId,
            requested: 1,
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error("Too many requests. Please try again later.");
            }

            throw new Error("Request blocked");
        }

        const user = await db.User.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) {
            throw new Error("User not found")
        }

        const collection = await db.collection.create({
            data: {
                name: data.name,
                description: data.description,
                userId: user.id
            }
        })

        revalidatePath('/dashboard');
        return collection;
    } catch (error) {
        throw new Error();
    }
}

//get collection
export async function getCollections() {
    try {
        const { userId } = await auth();
        if (!userId) return null; // Return null instead of throwing an error

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) return null; // Return null if user not found

        const collections = await db.collection.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return collections;
    } catch (error) {
        console.error("Error fetching collections:", error);
        return null;
    }
}


//delete collection
export async function deleteCollection(id: any) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        // Check if collection exists and belongs to user
        const collection = await db.collection.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!collection) throw new Error("Collection not found");

        // Delete the collection (entries will be cascade deleted)
        await db.collection.delete({
            where: { id },
        });

        return true;
    } catch (error) {
        throw new Error();
    }
}