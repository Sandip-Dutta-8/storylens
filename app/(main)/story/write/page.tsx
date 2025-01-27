'use client'

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import 'react-quill-new/dist/quill.snow.css';
import { storySchema } from '@/app/lib/schema';
import { BarLoader } from 'react-spinners';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMoodById, MOODS } from '@/app/lib/moods';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { useRouter } from 'next/navigation';
import { createJournalEntry } from '@/actions/story';
import { toast } from 'sonner';
import { createCollection, getCollections } from '@/actions/collection';
import CollectionForm from '@/components/CollectionForm';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const Write = () => {

  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const {
    loading: actionLoading,
    fn: actionFn,
    data: actionResult
  } = useFetch(createJournalEntry);

  const {
    loading: collectionsLoading,
    data: collections = [],
    fn: fetchCollections,
  } = useFetch(getCollections);

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createdCollection,
  } = useFetch(createCollection);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });


  useEffect(() => {
    if (actionResult && !actionLoading) {
      //@ts-ignore
      router.push(`/collection/${actionResult.collectionId ? actionResult.collectionId : "unorganized"}`);

      toast.success(`Entry Created Successfully`);
    }
  }, [actionResult, actionLoading])

  useEffect(() => {
    fetchCollections();
  }, [])


  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const mood = getMoodById(data.mood);

    actionFn(
      {
        ...data,
        moodScore: mood.score,
        moodQuery: mood.pixabayQuery,
      }
    )
  });

  useEffect(() => {
    if (createdCollection) {
      setIsCollectionDialogOpen(false);
      fetchCollections();
      //@ts-ignore
      setValue("collectionId", createdCollection.id);
      //@ts-ignore
      toast.success(`Collection ${createdCollection.name} created!`);
    }
  }, [createdCollection]);

  const handleCreateCollection = async (data: any) => {
    createCollectionFn(data);
  };

  const isLoading = actionLoading || collectionsLoading;

  return (
    <div className='py-8'>
      <form className="space-y-2  mx-auto" onSubmit={onSubmit}>
        <h1 className="text-5xl md:text-6xl gradient-title">
          What's on your mind?
        </h1>

        {isLoading && (
          <BarLoader className="mb-4" width={"100%"} color="orange" />
        )}

        <div className="space-y-1">
          <label className="text-md font-medium text-orange-700">Title</label>
          <Input
            disabled={isLoading}
            {...register("title")}
            placeholder="Give your entry a title..."
            className={`py-5 md:text-md ${errors.title ? "border-red-500" : ""
              }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-orange-700">How are you feeling?</label>
          <Controller
            name="mood"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.mood ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a mood..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MOODS).map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      <span className="flex items-center gap-2">
                        {mood.emoji} {mood.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mood && (
            <p className="text-red-500 text-sm">{errors.mood.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-orange-700">
            {getMoodById(getValues("mood"))?.prompt ?? "Write your thoughts..."}
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <ReactQuill
                readOnly={isLoading}
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            )}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-orange-700">
            Add to Collection (Optional)
          </label>
          <Controller
            name="collectionId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  if (value === "new") {
                    setIsCollectionDialogOpen(true);
                  } else {
                    field.onChange(value);
                  }
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections?.map((collection: any) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <span className="text-orange-600 cursor-pointer">
                      + Create New Collection
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-4 flex'>
          <Button type='submit' variant='journal' disabled={actionLoading}>
            Publish
          </Button>
        </div>
      </form>

      <CollectionForm
        loading={createCollectionLoading}
        onSuccess={handleCreateCollection}
        open={isCollectionDialogOpen}
        setOpen={setIsCollectionDialogOpen}
      />
    </div>
  )
}

export default Write