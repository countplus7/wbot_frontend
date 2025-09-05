import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Phone, Calendar, User, Bot, Download, Play, Pause, ImageIcon, Trash2 } from "lucide-react";
import { useBusinessConversations, useConversationMessages, useDeleteConversation } from "@/hooks/useBusinesses";
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
import type { Conversation, Message } from "@/lib/api";

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

  const { data: conversations = [], isLoading: conversationsLoading } = useBusinessConversations(businessId);
  const { data: conversationData, isLoading: messagesLoading } = useConversationMessages(
    selectedConversationId || 0,
    100, // Load more messages
    0
  );
  const deleteConversation = useDeleteConversation();

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

  const handleDeleteConversation = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    setConversationToDelete(conversation);
  };

  const confirmDeleteConversation = async () => {
    if (conversationToDelete) {
      await deleteConversation.mutateAsync(conversationToDelete.id);
      setConversationToDelete(null);

      // If the deleted conversation was selected, clear the selection
      if (selectedConversationId === conversationToDelete.id) {
        setSelectedConversationId(null);
      }
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
    <div className="h-full flex gap-4">
      {/* Conversations List */}
      <div className="w-[350px] min-w-[300px]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <p className="text-xl">Conversations</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No conversations found</div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversationId === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{formatPhoneNumber(conversation.phone_number)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {conversation.message_count} messages
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteConversation(conversation, e)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedConversationId ? (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <p className="text-xl">Messages</p>
                </div>
              ) : (
                <p className="text-xl">Select a conversation to view messages</p>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {!selectedConversationId ? (
                <div className="py-32 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation from the list to view messages</p>
                </div>
              ) : messagesLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading messages...</div>
              ) : !conversationData?.messages || conversationData.messages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No messages found in this conversation</div>
              ) : (
                <div className="space-y-4 p-4 pb-8">
                  {conversationData.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.direction === "inbound" ? "justify-start" : "justify-end"} ${
                        index === conversationData.messages.length - 1 ? "pb-8" : ""
                      }`}
                    >
                      <div
                        className={`max-w-[600px] rounded-lg p-3 ${
                          message.direction === "inbound" ? "bg-muted" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getMessageIcon(message)}
                          <span className="text-xs opacity-70">{getMessageTypeIcon(message.message_type)}</span>
                          <span className="text-xs opacity-70">{formatDate(message.created_at)}</span>
                        </div>

                        {message.content && <div className="text-sm">{message.content}</div>}

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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation with{" "}
              {conversationToDelete && formatPhoneNumber(conversationToDelete.phone_number)}? This action cannot be
              undone and will permanently delete all messages and media files in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteConversation.isPending}
            >
              {deleteConversation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
