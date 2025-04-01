'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/schemas/verifySchema';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.token,
      });

      toast.success(response.data.message)

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError?.response?.data.message || 'Error while sign-in')
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-yellow-500 px-4 py-6 sm:px-6 relative overflow-hidden">
       <div className="absolute inset-0 m-0  flex justify-center ">
        <h1 className="text-7xl lg:text-9xl font-extrabold text-white opacity-10 animate-pulse text-center">
          NO-FILTER
        </h1>
      </div>
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 space-y-6 bg-white rounded-lg shadow-md z-10">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 sm:mb-6">
            Hello {params.username}
            <span className="block mt-2">Verify Your Account</span>
          </h1>
          <p className="text-sm sm:text-base mb-2 sm:mb-4">Enter the verification code sent to your email</p>
          <p className='text-sm sm:text-base mb-2 sm:mb-4 font-bold text-red-400'>Check spam! 🚨 We have been censored! 😂📩</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              name="token"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Verification Code</FormLabel>
                  <Input className="text-sm sm:text-base p-2" {...field} />
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-sm sm:text-base py-2">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}