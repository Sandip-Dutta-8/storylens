'use client'

import React, { useEffect, useState } from 'react'
import CollectionPreview from './collection-preview'
import CollectionForm from '@/components/CollectionForm';
import useFetch from '@/hooks/use-fetch';
import { createCollection, getCollections } from '@/actions/collection';
import { toast } from 'sonner';

const Collections = ({ collections = [], entriesByCollection }: any) => {

    const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

    const {
        loading: createCollectionLoading,
        fn: createCollectionFn,
        data: createdCollection,
    } = useFetch(createCollection);

    useEffect(() => {
        if (createdCollection) {
            setIsCollectionDialogOpen(false);
            //@ts-ignore
            toast.success(`Collection ${createdCollection.name} created!`);
        }
    }, [createdCollection]);

    const handleCreateCollection = async (data: any) => {
        createCollectionFn(data);
    };

    if (collections.length === 0) return <></>;

    return (
        <section id="collections" className="space-y-6">
            <h2 className="text-3xl font-bold gradient-title">Collections</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Create New Collection Button */}
                <CollectionPreview
                    isCreateNew={true}
                    onCreateNew={() => setIsCollectionDialogOpen(true)}
                />

                {/* Unorganized Collection */}
                {entriesByCollection?.unorganized?.length > 0 && (
                    <CollectionPreview
                        name="Unorganized"
                        entries={entriesByCollection.unorganized}
                        isUnorganized={true}
                    />
                )}

                {/* User Collections */}
                {collections?.map((collection: any) => (
                    <CollectionPreview
                        key={collection.id}
                        id={collection.id}
                        name={collection.name}
                        entries={entriesByCollection[collection.id] || []}
                    />
                ))}

                <CollectionForm
                    loading={createCollectionLoading}
                    onSuccess={handleCreateCollection}
                    open={isCollectionDialogOpen}
                    setOpen={setIsCollectionDialogOpen}
                />
            </div>
        </section>
    )
}

export default Collections