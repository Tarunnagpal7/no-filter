'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema } from '@/schemas/signInSchema';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast.error('Incorrect Username or password');
      } else {
        toast.error(result.error);
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-yellow-500 relative overflow-hidden px-4 py-6 sm:px-6">
       <div className="absolute inset-0 m-0  flex justify-center ">
        <h1 className="text-7xl lg:text-9xl font-extrabold text-white opacity-10 animate-pulse text-center">
          NO-FILTER
        </h1>
      </div>
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 space-y-6 bg-white rounded-lg shadow-md z-10">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 sm:mb-6">
            Welcome Back to NO-FILTER
          </h1>
          <p className="text-sm sm:text-base mb-2 sm:mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email/Username</FormLabel>
                  <Input className="text-sm sm:text-base p-2" {...field} />
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                  <Input className="text-sm sm:text-base p-2" type="password" {...field} />
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <Button className="w-full text-sm sm:text-base py-2" type="submit">Sign In</Button>
          </form>
        </Form>
        <div className="text-center mt-2 sm:mt-4">
          <p className="text-sm sm:text-base">
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}