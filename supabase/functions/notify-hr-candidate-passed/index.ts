import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyHRRequest {
  candidateName: string;
  candidateEmail: string;
  processPosition: string;
  processRole: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { candidateName, candidateEmail, processPosition, processRole }: NotifyHRRequest = await req.json();

    console.log(`Notifying HR about candidate ${candidateName} passing final interview`);

    // Get all HR office users
    const { data: hrUsers, error: hrError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'hr_office');

    if (hrError) {
      console.error('Error fetching HR users:', hrError);
      throw hrError;
    }

    if (!hrUsers || hrUsers.length === 0) {
      console.log('No HR users found to notify');
      return new Response(JSON.stringify({ message: 'No HR users to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get HR user emails
    const hrUserIds = hrUsers.map(u => u.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .in('user_id', hrUserIds);

    if (profileError) {
      console.error('Error fetching HR profiles:', profileError);
      throw profileError;
    }

    const hrEmails = profiles?.map(p => p.email).filter(Boolean) || [];

    if (hrEmails.length === 0) {
      console.log('No HR emails found');
      return new Response(JSON.stringify({ message: 'No HR emails found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending notification to HR emails: ${hrEmails.join(', ')}`);

    // Send email using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Career Path Manager <onboarding@resend.dev>",
        to: hrEmails,
        subject: `🎉 Candidate Ready for Offer: ${candidateName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Candidate Passed Final Interview!</h1>
            <p>Great news! A candidate has successfully passed all interview stages and is ready to receive an offer.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #374151;">Candidate Details</h2>
              <p><strong>Name:</strong> ${candidateName}</p>
              <p><strong>Email:</strong> ${candidateEmail}</p>
              <p><strong>Position:</strong> ${processPosition}</p>
              <p><strong>Role:</strong> ${processRole}</p>
            </div>
            
            <p>Please log in to the Career Path Manager to send an offer to this candidate.</p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated notification from Career Path Manager.
            </p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-hr-candidate-passed function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);