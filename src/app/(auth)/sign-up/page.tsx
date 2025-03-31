"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useDebounceCallback } from 'usehooks-ts'
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { signUpSchema } from "@/schemas/signUpSchema"
import { useRouter } from "next/navigation"
import axios, {AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const page = () => {
    const [username,setUsername] = useState('');
    const [usernameMessage,setUsernameMessage] = useState('');
    const [isCheckingUsername,setIsCheckingUsername] = useState(false);
    const [isSubmitting,setIsSubmitting] = useState(false);
    const debounced = useDebounceCallback(setUsername , 300);

    const router = useRouter();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues:{
            username : '',
            email : '',
            password: '',
        },
    });

    useEffect(()=>{
       const checkUsernameUnique = async()=>{
           if(username){
            setIsCheckingUsername(true);
            setUsernameMessage('');
            try{
                const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`);
                console.log(response)
                setUsernameMessage(response.data.message);
            }catch(error){
                const axiosError = error as AxiosError<ApiResponse>;
                setUsernameMessage(axiosError?.response?.data.message || 'Error checking username') 
            }finally{
                setIsCheckingUsername(false);
            }
           }
        }
        checkUsernameUnique();
    },[username]);

    const onSubmit = async(data : z.infer<typeof signUpSchema>)=>{
        setIsSubmitting(true);
        try {
          const response = await axios.post<ApiResponse>('/api/sign-up', data);
    
          toast.success(response?.data.message)
    
          router.replace(`/verify/${username}`);
    
          setIsSubmitting(false);
        } catch (error) {
          console.error('Error during sign-up:', error);
    
          const axiosError = error as AxiosError<ApiResponse>;
    
          // Default error message
          let errorMessage = axiosError?.response?.data.message || 'There was a problem with your sign-up. Please try again.'
          
    
          toast.error(errorMessage)
    
          setIsSubmitting(false);
        }
    }

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
            Join NO-FILTER
          </h1>
          <p className="text-sm sm:text-base mb-2 sm:mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Username</FormLabel>
                  <div className="relative">
                    <Input
                      className="text-sm sm:text-base p-2"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-xs sm:text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <Input className="text-sm sm:text-base p-2" {...field} name="email" />
                  <p className="text-xs sm:text-sm text-gray-400">We will send you a verification code</p>
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
                  <Input className="text-sm sm:text-base p-2" type="password" {...field} name="password" />
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-sm sm:text-base py-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-2 sm:mt-4">
          <p className="text-sm sm:text-base">
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page