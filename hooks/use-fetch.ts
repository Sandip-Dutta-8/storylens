import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cd: any) => {
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fn = async (...args: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cd(...args);
            setData(response);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, setData, fn };
};

export default useFetch;
