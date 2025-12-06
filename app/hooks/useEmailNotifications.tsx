import { supabase } from "@/integrations/supabase/client";

export const useEmailNotifications = () => {
  const sendEmail = async (to: string, subject: string, title: string, content: string, link?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: { to, subject, title, content, link }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  };

  return { sendEmail };
};
