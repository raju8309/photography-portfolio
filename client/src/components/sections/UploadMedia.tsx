import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { InsertPhoto } from "@shared/schema";

export default function UploadMedia() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get('media') as File;
      
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      // Upload to a hosting service (you'll need to provide the service details)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { url } = await uploadResponse.json();

      // Create photo/video entry
      const photoData: Omit<InsertPhoto, "id"> = {
        title: formData.get('title') as string,
        imageUrl: url,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        type: file.type.startsWith('video/') ? 'video' : 'image',
      };

      await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData),
      });

      // Invalidate and refetch photos
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              name="media"
              accept="image/*,video/*"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <Input
              name="title"
              placeholder="Title"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <Input
              name="category"
              placeholder="Category (landscape or portrait)"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <Textarea
              name="description"
              placeholder="Description"
              required
              disabled={isUploading}
            />
          </div>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
