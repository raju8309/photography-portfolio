import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

// E.164 format validation
function isValidE164(phoneNumber: string): boolean {
  const e164Regex = /^\+[1-9]\d{10,14}$/;
  return e164Regex.test(phoneNumber);
}

// Update the verifyTwilioSetup function to handle missing/invalid config gracefully
export function verifyTwilioSetup(): { 
  isValid: boolean; 
  errors: string[]; 
  config: { 
    accountSid?: string; 
    fromNumber?: string; 
    toNumber?: string;
    webhookUrl?: string;
  } 
} {
  const errors: string[] = [];
  const config: { 
    accountSid?: string; 
    fromNumber?: string; 
    toNumber?: string;
    webhookUrl?: string;
  } = {};

  // Make Twilio optional - don't block website if not configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio credentials not configured, SMS features will be disabled');
    return {
      isValid: false,
      errors: ['Twilio not configured'],
      config: {}
    };
  }

  config.accountSid = process.env.TWILIO_ACCOUNT_SID;
  config.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  config.toNumber = '+16036001255'; // US phone number from Contact page
  config.webhookUrl = 'https://raju-kotturi-photography.Raj8309.repl.co/api/twilio/webhook';

  return {
    isValid: true,
    errors: [],
    config
  };
}

// Initialize Twilio client
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  try {
    const verification = verifyTwilioSetup();
    if (verification.isValid) {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('Twilio client initialized successfully');
    } else {
      console.error('Failed to initialize Twilio client:', verification.errors);
      twilioClient = null;
    }
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    twilioClient = null;
  }
} else {
  console.log('Missing Twilio credentials, SMS functionality will be disabled');
}

// Send SMS with better error handling
export async function sendSMS(message: string): Promise<boolean> {
  const verification = verifyTwilioSetup();

  if (!verification.isValid || !twilioClient) {
    console.error('Cannot send SMS - invalid setup:', {
      validationErrors: verification.errors,
      hasClient: !!twilioClient
    });
    return false;
  }

  try {
    console.log('Attempting to send SMS:', {
      to: verification.config.toNumber,
      from: verification.config.fromNumber,
      messageLength: message.length
    });

    const result = await twilioClient.messages.create({
      body: message,
      to: verification.config.toNumber!,
      from: verification.config.fromNumber!,
    });

    console.log('SMS sent successfully:', {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from
    });

    return true;
  } catch (error) {
    console.error('Failed to send SMS:', {
      error: error instanceof Error ? error.message : error,
      code: (error as any)?.code,
      status: (error as any)?.status,
      moreInfo: (error as any)?.moreInfo
    });
    return false;
  }
}