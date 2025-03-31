'use client'

import { MessageCard } from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Message } from "@/model/User"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw, Link, Copy, Bell, BellOff } from "lucide-react"
import { User } from 'next-auth'
import { useSession } from "next-auth/react"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from 'react-hook-form';
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-message');
      setValue('acceptMessages',response.data.isAccesptingMessages as boolean);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Failed to fetch message settings')
      throw new Error('Server Error! We are Trying to fix it')
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>('/api/get-message');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast.success('Messages refreshed successfully');
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(axiosError.response?.data.message || 'Failed to fetch messages')
      } finally {
        setIsLoading(false);
      }
    },
    []);

  // Fetch initial state from the server
  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [session,setValue,fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-message', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast.success(response.data.message);
      console.log(acceptMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ||
        'Failed to update message settings')
    }
  };

  if (!session || !session.user) {
    return <div className="h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please sign in to access your dashboard</p>
        </CardContent>
      </Card>
    </div>;
  }

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard');
  };

  return (
    <div className="container mx-auto py-6 px-4 ">
      <Card className="shadow-lg  border-0 bg-gradient-to-r from-yellow-50 to-indigo-50 ">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-indigo-50 rounded-t-lg pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-3xl m-4 font-bold text-gray-800">
              Your Dashboard
            </CardTitle>
            <Badge variant="secondary" className="text-sm px-3 py-1 ">
              @{username}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Profile Link Section */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-600" />
                Your Shared Profile Link
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    className="w-full p-3 pr-10 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={copyToClipboard} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy Link
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy your profile link to share</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {/* Message Settings Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                
                  Message Settings
                </h2>
                <div className="flex items-center gap-2">
                  <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                    className={acceptMessages ? "bg-green-600" : ""}
                  />
                
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Messages</h2>
              <Button
                variant="outline"
                onClick={() => fetchMessages(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            <Separator className="my-4" />

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <MessageCard
                      key={index}
                      message={message}
                      onMessageDelete={handleDeleteMessage}
                    />
                  ))
                ) : (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-2">No messages to display</p>
                    <p className="text-sm text-gray-400">Messages you receive will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}