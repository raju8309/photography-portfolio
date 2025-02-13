import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { InsertPhoto } from "@shared/schema";

export default function UploadPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get('photo') as File;
      
      if (!file) {
        throw new Error('Please select a photo to upload');
      }

      // Upload photo
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url } = await uploadResponse.json();

      // Create photo entry
      const photoData: Omit<InsertPhoto, "id"> = {
        title: formData.get('title') as string,
        imageUrl: url,
        category: formData.get('category') as string,
        description: formData.get('description') as string
      };

      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData),
      });

      if (!response.ok) {
        throw new Error('Failed to save photo details');
      }

      // Invalidate and refetch photos
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              name="photo"
              accept="image/*"
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
              placeholder="Category"
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
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
