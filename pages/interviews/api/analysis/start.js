import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { jobTitle, jobDescription, experienceLevel, inputType } = req.body;

    // Validate required fields
    if (!jobTitle || jobTitle.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Job title must be at least 3 characters' 
      });
    }

    if (inputType === 'description' && (!jobDescription || jobDescription.trim().length < 50)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Job description must be at least 50 characters' 
      });
    }

    // Generate requirement ID
    const requirementId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare webhook payload
    const webhookPayload = {
      requirement_id: requirementId,
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription?.trim() || '',
      experienceLevel: experienceLevel || 'mid',
      userId: req.headers['x-user-id'] || 'anonymous',
      timestamp: new Date().toISOString()
    };

    // Call n8n webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/submit-resume-analysis';
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || '',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      
      return res.status(500).json({ 
        error: 'Analysis submission failed',
        message: 'Failed to submit analysis to processing queue'
      });
    }

    const webhookResult = await webhookResponse.json();

    // Return success response
    return res.status(200).json({
      success: true,
      requirementId,
      status: 'submitted',
      message: 'Analysis submitted successfully',
      estimatedTime: '3-5 minutes',
      ...webhookResult
    });

  } catch (error) {
    console.error('Analysis start error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}