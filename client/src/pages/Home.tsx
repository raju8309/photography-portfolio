import Hero from "@/components/sections/Hero";
import Contact from "@/components/sections/Contact";
import ImageGrid from "@/components/sections/ImageGrid";

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="container mx-auto px-4 py-16">
        <section className="space-y-16">
          <div>
            <h1 className="text-4xl font-bold mb-4">Featured Work</h1>
            <p className="text-muted-foreground text-lg mb-8">
              A curated selection of my best photography and videography projects
            </p>
          </div>

          {/* Featured Photos Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-8">Featured Photography</h2>
            <p className="text-muted-foreground mb-6">
              Selected photography projects showcasing my best work
            </p>
            <ImageGrid 
              mediaType="image" 
              featured={true} 
              maxItems={4}
            />
          </section>

          {/* Videos Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-semibold mb-8">Video Content</h2>
            <p className="text-muted-foreground mb-6">
              Visual storytelling through cinematic videos
            </p>
            <ImageGrid 
              mediaType="video" 
              maxItems={3}
            />
          </section>
        </section>
      </div>
      <Contact />
    </main>
  );
}