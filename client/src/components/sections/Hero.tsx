import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/60 to-background/95 z-10"
      />

      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://source.unsplash.com/1920x1080/?landscape,mountain')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <motion.div 
        className="container mx-auto px-4 text-center relative z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Capturing Life's Beautiful Moments
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Professional photographer specializing in portrait and landscape photography
        </p>
        <Link href="/gallery">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg font-medium cursor-pointer"
          >
            View Gallery
          </motion.a>
        </Link>
      </motion.div>
    </section>
  );
}