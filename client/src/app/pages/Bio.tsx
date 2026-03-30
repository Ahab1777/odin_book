import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { api } from "../../lib/api";

export default function Bio() {
  const { userId } = useParams;
  const [bio, setBio] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadBio() {
            try {
                const res = await api.get
            }
        }


    })
    
    
    
  return <></>;
}
