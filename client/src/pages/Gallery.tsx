import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Photo } from "@shared/schema";
import ImageGrid from "@/components/sections/ImageGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function Gallery() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const files = formData.getAll('media') as File[];
      const featured = formData.get('featured') === 'true';
      const homePage = formData.get('homePage') === 'true';

      if (files.length === 0) {
        throw new Error('Please select photos to upload');
      }

      // Upload each file
      for (const file of files) {
        // Only allow images
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select only image files');
        }

        const individualFormData = new FormData();
        individualFormData.append('media', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: individualFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photo');
        }

        const { url } = await uploadResponse.json();

        // Create photo entry
        const mediaData = {
          title: formData.get('title') as string,
          imageUrl: url,
          category: formData.get('category') as string,
          description: formData.get('description') as string,
          type: 'image',
          featured,
          homePage
        };

        const response = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData),
        });

        if (!response.ok) {
          throw new Error('Failed to save photo details');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });

      toast({
        title: "Success",
        description: `${files.length} photos uploaded successfully`,
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio Gallery</h1>
        <p className="text-muted-foreground mb-8">
          A collection of my photography work
        </p>

        {isAuthenticated && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Input
                    type="file"
                    name="media"
                    accept="image/*"
                    multiple
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
                  <select
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isUploading}
                  >
                    <option value="">Select Category</option>
                    <option value="landscape">Landscape Photography</option>
                    <option value="portrait">Portrait Photography</option>
                  </select>
                </div>
                <div>
                  <Textarea
                    name="description"
                    placeholder="Description"
                    required
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      value="true"
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isUploading}
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Feature this photo (Best photos only)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="homePage"
                      id="homePage"
                      value="true"
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isUploading}
                    />
                    <label htmlFor="homePage" className="text-sm font-medium">
                      Show on Home Page
                    </label>
                  </div>
                </div>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-12">
          {/* Landscape Photos Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-8">Landscape Photography</h2>
            <ImageGrid
              showHomePageToggle={isAuthenticated}
              mediaType="image"
              category="landscape"
            />
          </section>

          {/* Portrait Photos Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-8">Portrait Photography</h2>
            <ImageGrid
              showHomePageToggle={isAuthenticated}
              mediaType="image"
              category="portrait"
            />
          </section>
        </div>
      </div>
    </main>
  );
}