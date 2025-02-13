import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Edit, Video, ImagePlus } from "lucide-react";

const services = [
  {
    title: "Professional Photo Editing",
    description: "Expert photo retouching, color grading, and enhancement services to perfect your images",
    icon: Edit
  },
  {
    title: "Video Editing",
    description: "Professional video editing including color correction, transitions, and effects",
    icon: Video
  },
  {
    title: "Portrait Retouching",
    description: "Specialized portrait retouching services to enhance facial features and skin tones",
    icon: ImagePlus
  }
];

export default function Services() {
  return (
    <main className="pt-20">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Professional Editing Services</h1>
        <p className="text-muted-foreground mb-12">
          Transform your photos and videos with professional editing services
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.title}>
              <CardHeader>
                <service.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}