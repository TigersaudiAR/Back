import { useEffect, useState } from "react";

interface Surah {
  id: number;
  name: string;
  ayahs: number;
}

const API_URL = "https://<your-backend>.onrender.com/api/quran";

const QuranList = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response format");
        }

        setSurahs(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            ayahs: item.ayahs,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8">
      <header>
        <h1 className="text-3xl font-semibold">Quran Surah List</h1>
        <p className="text-muted-foreground">
          Browse the chapters of the Quran fetched from the backend service.
        </p>
      </header>

      {isLoading && <p>Loading surahs...</p>}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Failed to load surahs: {error}
        </div>
      )}

      {!isLoading && !error && (
        <ul className="space-y-3">
          {surahs.map((surah) => (
            <li
              key={surah.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-lg font-semibold">{surah.id}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-sm font-medium text-muted-foreground">Surah</p>
                  <p className="text-lg font-semibold">{surah.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Ayahs</p>
                  <p className="text-lg font-semibold">{surah.ayahs}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && !error && surahs.length === 0 && (
        <p className="text-muted-foreground">No surahs available.</p>
      )}
    </section>
  );
};

export default QuranList;
