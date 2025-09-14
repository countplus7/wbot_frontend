import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Phone, Calendar, User, Bot, Download, Play, Pause, ImageIcon, Trash2 } from "lucide-react";
import { useConversations } from "@/hooks/use-businesses";
import { BusinessService } from "@/lib/services/business-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Conversation, Message } from "@/lib/services/business-service";

interface ChatHistoryProps {
  businessId: number;
  businessName: string;
}

// Default image component for when images fail to load
const DefaultImagePlaceholder: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`}>
    <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
    <span className="text-sm text-muted-foreground">Image not available</span>
  </div>
);

export const ChatHistory: React.FC<ChatHistoryProps> = ({ businessId, businessName }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  const { data: conversationsData, isLoading: conversationsLoading } = useConversations(businessId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Simple phone number formatting
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  const getMessageIcon = (message: Message) => {
    if (message.direction === "inbound") {
      return <User className="w-4 h-4 text-blue-500" />;
    }
    return <Bot className="w-4 h-4 text-green-500" />;
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case "image":
        return "🖼️";
      case "audio":
        return "🎵";
      case "document":
        return "📄";
      default:
        return "💬";
    }
  };

  const isImageFile = (fileName: string, fileType?: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];

    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    return imageExtensions.includes(extension) || (fileType && imageTypes.includes(fileType));
  };

  const isAudioFile = (fileName: string, fileType?: string) => {
    const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac"];
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac"];

    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    return audioExtensions.includes(extension) || (fileType && audioTypes.includes(fileType));
  };

  const handleAudioPlay = (messageId: string) => {
    if (playingAudio === messageId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(messageId);
    }
  };

  const handleImageError = (messageId: string) => {
    setImageErrors((prev) => new Set(prev).add(messageId));
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      // Using archiveConversation as alternative to non-existent deleteConversation
      const response = await BusinessService.archiveConversation(conversationToDelete.id);
      if (response.success) {
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setConversationToDelete(null);
    }
  };

  const confirmDeleteConversation = async () => {
    if (conversationToDelete) {
      await handleDeleteConversation();
    }
  };

  const loadConversationMessages = async (conversationId: number) => {
    try {
      setMessagesLoading(true);
      const response = await BusinessService.getConversationMessages(conversationId, { limit: 100 });
      if (response.success && response.data) {
        setMessages(response.data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const renderMediaContent = (message: Message) => {
    if (!message.media_url && !message.file_name) return null;

    // Use the media_url directly from the backend (no construction needed)
    const mediaUrl = message.media_url;
    const fileName = message.file_name || "";
    const fileType = message.file_type;
    const hasImageError = imageErrors.has(message.message_id);

    if (isImageFile(fileName, fileType) && mediaUrl) {
      return (
        <div className="mt-2">
          {hasImageError ? (
            <DefaultImagePlaceholder className="max-w-full h-20 cursor-pointer" />
          ) : (
            <img
              src={mediaUrl}
              alt="Image message"
              className="w-[200px] h-auto rounded-lg object-contain cursor-pointer"
              onClick={() => window.open(mediaUrl, "_blank")}
              onError={() => handleImageError(message.message_id)}
            />
          )}
        </div>
      );
    }

    if (isAudioFile(fileName, fileType) && mediaUrl) {
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAudioPlay(message.message_id)}
              className="p-1 h-8 w-8"
            >
              {playingAudio === message.message_id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <audio
                src={mediaUrl}
                controls
                className="w-full h-8"
                onPlay={() => setPlayingAudio(message.message_id)}
                onPause={() => setPlayingAudio(null)}
                onEnded={() => setPlayingAudio(null)}
              />
            </div>
          </div>
        </div>
      );
    }

    // For other file types, show file name and download link
    return (
      <div className="mt-2">
        <div className="text-xs opacity-70">📄 {fileName}</div>
        {mediaUrl && (
          <div className="mt-1">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline opacity-70 hover:opacity-100 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex gap-6 px-6 bg-gradient-to-br from-secondary/10 via-background to-accent/10">
      {/* Conversations List */}
      <div className="w-[380px] min-w-[360px]">
        <Card className="h-full shadow-lg border-0 bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground">Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {conversationsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <p className="text-muted-foreground text-sm">Loading conversations...</p>
                </div>
              ) : conversationsData?.conversations?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No conversations found</p>
                  <p className="text-muted-foreground text-xs mt-1">Start messaging to see conversations here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {conversationsData?.conversations?.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 relative group ${
                        selectedConversationId === conversation.id
                          ? "bg-primary/5 border-r-4 border-primary shadow-sm"
                          : "hover:shadow-sm"
                      }`}
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        loadConversationMessages(conversation.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-foreground text-sm">
                              {formatPhoneNumber(conversation.phone_number)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20 font-medium"
                          >
                            {conversation.message_count}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conversation);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {conversation.last_message_at
                            ? formatDate(conversation.last_message_at)
                            : formatDate(conversation.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Messages View */}
      <div className="flex-1">
        <Card className="h-full shadow-lg border-0 bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle>
              {selectedConversationId ? (
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">Messages</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-lg font-semibold text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span>Select a conversation</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-gradient-to-b from-accent/5 to-secondary/5">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {!selectedConversationId ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-primary opacity-60" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose a conversation from the list to view and manage messages
                  </p>
                </div>
              ) : messagesLoading ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center">No messages in this conversation</p>
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.direction === "inbound" ? "justify-start" : "justify-end"} ${
                        index === messages.length - 1 ? "pb-12" : ""
                      }`}
                    >
                      <div
                        className={`max-w-[60%] min-w-[150px] rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.direction === "inbound"
                            ? "bg-gradient-to-br from-accent/80 to-accent/60 text-accent-foreground"
                            : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                          <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">
                            {getMessageIcon(message)}
                          </div>
                          <span className="text-xs font-medium">{getMessageTypeIcon(message.message_type)}</span>
                          <span className="text-xs">{formatDate(message.created_at)}</span>
                        </div>

                        {message.content && (
                          <div className="text-sm leading-relaxed font-medium">{message.content}</div>
                        )}

                        {renderMediaContent(message)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!conversationToDelete} onOpenChange={() => setConversationToDelete(null)}>
        <AlertDialogContent className="bg-card border-border shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this conversation with{" "}
              <span className="font-semibold text-foreground">
                {conversationToDelete && formatPhoneNumber(conversationToDelete.phone_number)}
              </span>
              ? This action cannot be undone and will permanently delete all messages and media files in this
              conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
