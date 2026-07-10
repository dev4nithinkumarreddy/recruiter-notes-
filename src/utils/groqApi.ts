interface ExtractedResumeData {
  fullName?: string;
  experience?: number;
  email?: string;
  phone?: string;
  currentCompany?: string;
  currentRole?: string;
  skills?: string[];
  notes?: string;
}

export const extractDetailsFromResume = async (resumeText: string, groqKey: string): Promise<ExtractedResumeData> => {
  if (!groqKey) {
    throw new Error('Groq API Key is not configured in Settings.');
  }

  const prompt = `
You are an expert resume parser. Extract the following information from the resume text provided below and return it strictly as a JSON object with the following keys. Do not include markdown formatting or explanations, only valid JSON.

JSON format:
{
  "fullName": "Full Name",
  "experience": number (total years of experience, e.g., 5.5. Estimate if not explicitly stated based on work history. 0 if fresh graduate),
  "email": "Email Address",
  "phone": "Phone Number",
  "currentCompany": "Most recent company name",
  "currentRole": "Most recent job title",
  "skills": ["Skill 1", "Skill 2"],
  "notes": "A brief 2-3 sentence summary of their profile"
}

Resume Text:
${resumeText.substring(0, 15000)} // Truncating to avoid token limits just in case
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile', // High accuracy for structured extraction
      messages: [
        { role: 'system', content: 'You are a helpful assistant that strictly outputs JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  try {
    const parsedData = JSON.parse(content);
    return parsedData as ExtractedResumeData;
  } catch (err) {
    throw new Error('Failed to parse Groq API response as JSON.');
  }
};

export const generateMessageDraft = async (
  candidateName: string,
  stage: string,
  jobTitle: string,
  recruiterName: string,
  type: 'email' | 'whatsapp',
  tone: 'Professional' | 'Friendly' | 'Urgent',
  groqKey: string
): Promise<string> => {
  if (!groqKey) {
    throw new Error('Groq API Key is not configured in Settings.');
  }

  const prompt = `
You are an expert recruiter named ${recruiterName}. Write a short, highly personalized ${type} draft to a candidate named ${candidateName} who applied for the "${jobTitle}" role and is currently at the "${stage}" stage. 
The tone should be ${tone}.
Keep it concise, realistic, and do not include subject lines if it's WhatsApp. Do not wrap the message in quotes. Only return the final message text.
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helpful recruitment assistant. Output only the final message text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
};
