import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertPhotoSchema, loginSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { sendContactEmail } from "./utils/email";
import session from "express-session";
import bcrypt from "bcryptjs";
import { sendSMS, verifyTwilioSetup } from "./utils/sms";

declare module 'express-session' {
  interface SessionData {
    isAuthenticated: boolean;
  }
}

// Setup session middleware first
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const cacheControl = (maxAge: number) => (_req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  next();
};

const createAdminIfNotExists = async () => {
  try {
    const existingAdmin = await storage.getAdminByUsername('Raju');
    if (!existingAdmin) {
      await storage.createAdmin({
        username: 'Raju',
        password: 'Verizonsam@8309'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Apply session middleware
  app.use(sessionMiddleware);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    }
  });

  // Serve uploaded files with caching
  app.use('/uploads',
    cacheControl(24 * 60 * 60), // 24 hours cache
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: '1d',
      immutable: true
    })
  );

  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(credentials.username);

      if (!admin) {
        console.log('No admin found with username:', credentials.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        admin.password
      );

      if (!isValidPassword) {
        console.log('Invalid password for user:', credentials.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.isAuthenticated = true;
      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Error logging out" });
      } else {
        res.json({ message: "Logged out successfully" });
      }
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAuthenticated });
  });

  // Protected upload endpoint
  app.post('/api/upload', isAuthenticated, upload.single('media'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Protected photo creation endpoint
  app.post("/api/photos", isAuthenticated, async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error adding media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  // Protected photo deletion endpoint
  app.delete("/api/photos/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePhoto(id);
      if (!success) {
        res.status(404).json({ message: "Media not found" });
        return;
      }
      res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Add this new endpoint after the delete endpoint and before the public endpoints
  app.patch("/api/photos/:id/homepage", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { homePage } = req.body;

      if (typeof homePage !== 'boolean') {
        res.status(400).json({ message: "homePage must be a boolean value" });
        return;
      }

      const photo = await storage.updatePhotoHomePage(id, homePage);

      if (!photo) {
        res.status(404).json({ message: "Photo not found" });
        return;
      }

      res.json(photo);
    } catch (error) {
      console.error("Error updating photo homepage status:", error);
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  // Public endpoints
  app.get("/api/photos", async (_req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(parseInt(req.params.id));
      if (!photo) {
        res.status(404).json({ message: "Media not found" });
        return;
      }
      res.json(photo);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Update the contact endpoint to handle missing SMS configuration
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate email format
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Send email notification
      const emailSent = await sendContactEmail({ name, email, message });

      // Format and send SMS notification
      const smsMessage = `New Contact Form Message from ${name}\nEmail: ${email}\nMessage: ${message}`;
      const smsSent = await sendSMS(smsMessage);

      res.json({
        message: "Message sent successfully",
        email: emailSent,
        sms: smsSent
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({
        message: "Failed to send message. Please try again later."
      });
    }
  });

  app.get("/api/twilio/verify", async (req, res) => {
    try {
      const verification = verifyTwilioSetup();
      res.json({
        isValid: verification.isValid,
        errors: verification.errors,
        config: {
          ...verification.config,
          // Mask sensitive data
          accountSid: verification.config.accountSid ?
            `${verification.config.accountSid.slice(0, 4)}...${verification.config.accountSid.slice(-4)}` :
            undefined
        }
      });
    } catch (error) {
      console.error("Error verifying Twilio setup:", error);
      res.status(500).json({
        message: "Failed to verify Twilio setup",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/twilio/webhook", (req, res) => {
    try {
      console.log('Received Twilio webhook:', {
        body: req.body,
        method: req.method,
        headers: req.headers
      });

      // Send a TwiML response
      res.type('text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>Message received successfully</Message>
        </Response>`);
    } catch (error) {
      console.error('Twilio webhook error:', error);
      res.status(500).json({
        message: "Webhook processing failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/test-sms", async (req, res) => {
    try {
      console.log('Testing SMS configuration:', {
        twilioConfig: verifyTwilioSetup(),
        replitDomain: req.get('host')
      });

      // Send a test SMS
      const testMessage = "This is a test SMS from your photography portfolio website.";
      const success = await sendSMS(testMessage);

      if (success) {
        res.json({
          message: "Test SMS sent successfully",
          webhookUrl: `https://${req.get('host')}/api/twilio/webhook`
        });
      } else {
        res.status(500).json({ message: "Failed to send test SMS" });
      }
    } catch (error) {
      console.error("Error sending test SMS:", error);
      res.status(500).json({
        message: "Failed to send test SMS",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create initial admin user
  createAdminIfNotExists();

  return httpServer;
}