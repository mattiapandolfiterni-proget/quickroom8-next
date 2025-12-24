import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { requireConversationParticipant, handleSecurityError, logSecurityEvent } from '@/lib/security';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new]);
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const typingUsers = Object.values(state).flat();
          setOtherUserTyping(typingUsers.some((u: any) => u.user_id !== user?.id && u.typing));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: user?.id, typing: false });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchConversations = async () => {
    try {
      // Get conversations the user is part of
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error fetching participant data:', participantError);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
        return;
      }

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Fetch conversation details with listing info
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          listing_id,
          room_listings (
            title,
            location
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        toast({
          title: "Error",
          description: "Failed to load conversation details",
          variant: "destructive"
        });
        return;
      }

      // For each conversation, get the other participant's info
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles (
                full_name,
                avatar_url
              )
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          const otherUser = participants?.[0]?.profiles;
          
          // Get the last message for preview
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            otherUserName: otherUser?.full_name || 'User',
            otherUserAvatar: otherUser?.avatar_url,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            listingTitle: conv.room_listings?.title
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    // Store message content but DON'T clear until DB confirms
    
    console.log('[SendMessage] Sending message to conversation:', selectedConversation);

    try {
      // SECURITY: Verify user is a participant before sending
      // This prevents ID spoofing where user manipulates conversation ID
      try {
        await requireConversationParticipant(user, selectedConversation);
      } catch (securityError) {
        logSecurityEvent('MESSAGE_SEND_UNAUTHORIZED', user.id, { conversationId: selectedConversation });
        const toastData = handleSecurityError(securityError);
        toast(toastData);
        return;
      }

      // Insert message with select to verify persistence
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: messageContent,
          message_type: 'text'
        })
        .select('*')
        .single();

      if (error) {
        console.error('[SendMessage] Insert error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive"
        });
        return;
      }

      // CRITICAL: Verify message was actually persisted
      if (!data || !data.id) {
        console.error('[SendMessage] No data returned after insert');
        toast({
          title: "Error",
          description: "Message may not have been saved. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('[SendMessage] Message saved with ID:', data.id);

      // Only clear after DB confirms
      setNewMessage('');

      // Update conversation's updated_at timestamp (non-blocking but logged)
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      if (updateError) {
        console.warn('[SendMessage] Failed to update conversation timestamp (non-critical):', updateError);
      }

      handleTyping(false);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || "Failed to send message. Please try again.";
      console.error('[SendMessage] Error:', errorMessage, error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleTyping = async (typing: boolean) => {
    setIsTyping(typing);
    const channel = supabase.channel(`messages:${selectedConversation}`);
    await channel.track({ user_id: user.id, typing });
    
    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    setUploadingFile(true);
    try {
      // SECURITY: Verify user is a participant before uploading
      try {
        await requireConversationParticipant(user, selectedConversation);
      } catch (securityError) {
        logSecurityEvent('FILE_UPLOAD_UNAUTHORIZED', user.id, { conversationId: selectedConversation });
        const toastData = handleSecurityError(securityError);
        toast(toastData);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath);

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';

      await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: file.name,
        message_type: messageType,
        file_url: publicUrl
      });

      toast({
        title: "File sent",
        description: "Your file has been uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="p-4">
            <h2 className="text-xl font-display font-bold mb-4">Messages</h2>
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedConversation === conv.id
                          ? 'bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {conv.otherUserName?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{conv.otherUserName || 'User'}</p>
                          {conv.listingTitle && (
                            <p className="text-xs text-primary truncate">
                              {conv.listingTitle}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage || 'Start a conversation'}
                          </p>
                        </div>
                        {conv.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 p-4 flex flex-col">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                         <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.sender_id === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.message_type === 'image' && message.file_url && (
                            <img src={message.file_url} alt={message.content} className="max-w-full rounded-lg mb-2" />
                          )}
                          {message.message_type === 'file' && message.file_url && (
                            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-2 underline">
                              <FileText className="w-4 h-4" />
                              {message.content}
                            </a>
                          )}
                          {message.message_type === 'text' && <p>{message.content}</p>}
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {otherUserTyping && (
                  <div className="text-sm text-muted-foreground italic px-4 py-2">
                    Someone is typing...
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(e.target.value.length > 0);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={uploadingFile}
                  />
                  <Button onClick={sendMessage} disabled={uploadingFile}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
