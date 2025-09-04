import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Phone, Calendar, User, Bot, Download, Play, Pause } from "lucide-react";
import { useBusinessConversations, useConversationMessages } from "@/hooks/useBusinesses";
import type { Conversation, Message } from "@/lib/api";

interface ChatHistoryProps {
  businessId: number;
  businessName: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ businessId, businessName }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useBusinessConversations(businessId);
  const { data: conversationData, isLoading: messagesLoading } = useConversationMessages(
    selectedConversationId || 0,
    100, // Load more messages
    0
  );

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

  const renderMediaContent = (message: Message) => {
    if (!message.media_url && !message.file_name) return null;

    const mediaUrl = message.media_url;
    const fileName = message.file_name || "";
    const fileType = message.file_type;

    if (isImageFile(fileName, fileType) && mediaUrl) {
      return (
        <div className="mt-2">
          <img
            src={mediaUrl}
            alt={fileName}
            className="max-w-full max-h-64 rounded-lg object-contain"
            onError={(e) => {
              // Fallback to file name if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div className="hidden text-xs opacity-70 mt-1">📁 {fileName}</div>
          {fileName && (
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
          {fileName && <div className="mt-1 text-xs opacity-70">🎵 {fileName}</div>}
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
              Conversations - {businessName}
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
                        <Badge variant="outline" className="text-xs">
                          {conversation.message_count} messages
                        </Badge>
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
                  Messages
                  {conversationData?.conversation && (
                    <span className="text-sm font-normal text-muted-foreground">
                      - {formatPhoneNumber(conversationData.conversation.phone_number)}
                    </span>
                  )}
                </div>
              ) : (
                "Select a conversation to view messages"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {!selectedConversationId ? (
                <div className="p-8 text-center text-muted-foreground">
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
    </div>
  );
};
