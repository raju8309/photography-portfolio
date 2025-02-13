import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-6 text-foreground">About Me</h1>

            <div className="prose prose-lg dark:prose-invert">
              <p className="text-foreground/75">
                Hi, I'm Raju kotturi, a professional photographer from Hyderabad, India, 
                currently pursuing my Masters in the United States. My passion lies in capturing 
                the beauty of our world through portrait and landscape photography.
              </p>

              <p className="text-foreground/75">
                With 5 years of experience in photo and video editing, I've developed a keen eye 
                for detail and artistic expression. My work focuses on bringing out the authentic 
                essence of each subject while maintaining artistic vision, whether it's through 
                photography or post-processing.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">My Approach</h2>
              <p className="text-foreground/75">
                I believe in creating images that not only capture the visual beauty but also 
                evoke emotions and tell stories. Whether it's a misty mountain sunrise or a 
                carefully composed portrait, each photo is thoughtfully crafted and edited to bring 
                out its best qualities.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">Services</h2>
              <p className="text-foreground/75">
                Besides photography, I offer professional photo and video editing services, 
                leveraging my 5 years of expertise in post-processing. I work closely with 
                clients to understand their vision and help bring their creative projects to 
                life through expert editing techniques.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}