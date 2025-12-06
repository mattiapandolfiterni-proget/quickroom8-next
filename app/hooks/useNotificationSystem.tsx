import { supabase } from "@/integrations/supabase/client";
import { useEmailNotifications } from "./useEmailNotifications";

interface CreateNotificationParams {
  userId: string;
  title: string;
  content: string;
  type: string;
  link?: string;
  sendEmail?: boolean;
  userEmail?: string;
}

export const useNotificationSystem = () => {
  const { sendEmail } = useEmailNotifications();

  const createNotification = async ({
    userId,
    title,
    content,
    type,
    link,
    sendEmail: shouldSendEmail = false,
    userEmail
  }: CreateNotificationParams) => {
    try {
      // Create in-app notification
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          content,
          type,
          link
        })
        .select()
        .single();

      if (notificationError) throw notificationError;

      // Send email if requested and user email is provided
      if (shouldSendEmail && userEmail) {
        const fullLink = link ? `${window.location.origin}${link}` : undefined;
        await sendEmail(userEmail, title, title, content, fullLink);
      }

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
  };

  const notifyNewMessage = async (recipientId: string, senderName: string, recipientEmail?: string) => {
    return createNotification({
      userId: recipientId,
      title: 'New Message',
      content: `You have a new message from ${senderName}`,
      type: 'message',
      link: '/messages',
      sendEmail: true,
      userEmail: recipientEmail
    });
  };

  const notifyNewBooking = async (ownerId: string, listingTitle: string, ownerEmail?: string) => {
    return createNotification({
      userId: ownerId,
      title: 'New Viewing Request',
      content: `Someone requested a viewing for "${listingTitle}"`,
      type: 'booking',
      link: '/appointments',
      sendEmail: true,
      userEmail: ownerEmail
    });
  };

  const notifyListingApproved = async (userId: string, listingTitle: string, userEmail?: string) => {
    return createNotification({
      userId,
      title: 'Listing Approved',
      content: `Your listing "${listingTitle}" has been approved and is now live!`,
      type: 'listing',
      link: '/my-listings',
      sendEmail: true,
      userEmail
    });
  };

  const notifyNewReview = async (userId: string, reviewerName: string, userEmail?: string) => {
    return createNotification({
      userId,
      title: 'New Review',
      content: `${reviewerName} left you a new review`,
      type: 'review',
      link: '/profile',
      sendEmail: true,
      userEmail
    });
  };

  return {
    createNotification,
    notifyNewMessage,
    notifyNewBooking,
    notifyListingApproved,
    notifyNewReview
  };
};
