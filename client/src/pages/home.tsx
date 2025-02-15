import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/format";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const { toast } = useToast();

  const extractDuration = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setDuration(null);

    try {
      const video = document.createElement("video");
      video.style.display = "none";
      
      const promise = new Promise<number>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve(video.duration);
          document.body.removeChild(video);
        };
        
        video.onerror = () => {
          document.body.removeChild(video);
          reject(new Error("Failed to load video"));
        };
      });

      document.body.appendChild(video);
      video.src = url;

      const videoDuration = await promise;
      setDuration(videoDuration);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not extract video duration. Please check the URL and ensure it's a valid video file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Video Duration Extractor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={extractDuration}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Extract"
                )}
              </Button>
            </div>

            {duration !== null && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Duration:</p>
                <p className="text-2xl font-bold">{formatDuration(duration)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
