'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, AlertTriangle, UserX, Send, RefreshCw,  MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {  CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  
  // State for user status
  const [userStatus, setUserStatus] = useState<{
    isLoading: boolean;
    error: string | null;
    notFound: boolean;
    notAcceptingMessages: boolean;
  }>({
    isLoading: true,
    error: null,
    notFound: false,
    notAcceptingMessages: false
  });
  
  // Suggested messages state
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(
    parseStringMessages(initialMessageString)
  );
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');
  
  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  // Check user status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      setUserStatus(prev => ({ ...prev, isLoading: true }));
      try {
         await axios.get<ApiResponse>(`/api/check-username?username=${username}`);
        
        // User exists and is accepting messages
        setUserStatus({
          isLoading: false,
          error: null,
          notFound: false,
          notAcceptingMessages: false
        });
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.log("Error status:", axiosError.response?.status);
        console.log("Error message:", axiosError.response?.data.message);
        
        if (axiosError.response?.status === 403 || axiosError.response?.status === 405) {
          // User exists but not accepting messages
          setUserStatus({
            isLoading: false,
            error: axiosError.response.data.message || 'User is not accepting messages',
            notFound: false,
            notAcceptingMessages: true
          });
        } else {
          // User not found or other error
          setUserStatus({
            isLoading: false,
            error: axiosError.response?.data.message || 'Failed to find user',
            notFound: true,
            notAcceptingMessages: false
          });
        }
      }
    };

    if (username) {
      checkUserStatus();
    }
  }, [username]);

  // New function to fetch suggestions
  const handleSuggestMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const text = await response.text();
      setSuggestedMessages(parseStringMessages(text));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to get message suggestions");
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSubmitLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to send message');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Loading state
  if (userStatus.isLoading) {
    return (
      <div className="container mx-auto my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl max-w-4xl flex flex-col items-center justify-center min-h-[400px] shadow-lg">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-700 font-medium text-lg">Checking user status...</p>
      </div>
    );
  }

  // User not found state
  if (userStatus.notFound) {
    return (
      <div className="container mx-auto my-8 p-6 bg-white rounded-xl max-w-4xl shadow-lg">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 p-5 rounded-full mb-6">
            <UserX className="h-20 w-20 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-center text-gray-800">User Not Found</h1>
          <p className="text-gray-600 mb-8 text-center text-lg max-w-md">
            The user @{username} does not exist in our system.
          </p>
          <div className="text-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="lg" className="rounded-full px-6 border-2 hover:bg-gray-100">
                Go Home
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not accepting messages state
  if (userStatus.notAcceptingMessages) {
    return (
      <div className="container mx-auto my-8 p-6 bg-white rounded-xl max-w-4xl shadow-lg">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-amber-50 p-5 rounded-full mb-6">
            <AlertTriangle className="h-20 w-20 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-center text-gray-800">Messages Disabled</h1>
          <p className="text-gray-600 mb-8 text-center text-lg max-w-md">
            @{username} is not accepting anonymous messages at this time.
          </p>
          <div className="text-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="lg" className="rounded-full px-6 border-2 hover:bg-gray-100">
                Go Home
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal view - user exists and accepts messages
  return (
    <div className="container mx-auto my-8 px-4 md:px-0 ">
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl max-w-4xl mx-auto shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              NO-FILTER
            </h1>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              Send a Message
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Your message will be sent anonymously to @{username}. They wont know who sent it.
            </p>
          </div>
          
          <Card className="border-0 shadow-md bg-white mb-8">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">
                          Send Anonymous Message to <span className="font-semibold text-blue-600">@{username}</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your anonymous message here..."
                            className="resize-none min-h-[150px] text-lg p-4 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-center pt-2">
                    {isSubmitLoading ? (
                      <Button disabled className="px-8 py-6 rounded-full text-lg">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isSubmitLoading || !messageContent}
                        className="px-8 py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-lg shadow-md transition-all hover:shadow-lg"
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <MessageSquare className="text-blue-500 mr-2 h-5 w-5" />
                Message Ideas
              </h3>
              <Button
                onClick={handleSuggestMessages}
                variant="outline"
                disabled={isSuggestLoading}
                className="rounded-full border-2 hover:bg-blue-50"
              >
                {isSuggestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Ideas
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Click on any message to use it</p>
            
            {/* Flexible suggestion list that handles messages of varying lengths */}
            <Card className="shadow-sm bg-white border-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  {suggestedMessages.map((message, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleMessageClick(message)}
                      className="cursor-pointer bg-gray-50 hover:bg-blue-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-all hover:shadow-sm"
                    >
                      <p className="text-gray-800">{message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center bg-white p-6 rounded-xl shadow-sm">
            <div className="mb-4 text-gray-700 font-medium">Want to receive anonymous messages too?</div>
            <Link href={'/sign-up'}>
              <Button className="px-8 py-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-md">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}