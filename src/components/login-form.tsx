import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { setAuthenticated } from '@/redux/ui-slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const formSchema = z.object({
  email: z.email('masukan email').min(1, 'masukan email'),
  password: z.string().min(1, 'masukkan sandi').max(255, 'masukkan sandi'),
});

type LoginFormData = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        toast.success('Login Failed', {
          description: `Unauthorized`,
        });
        return;
      }

      const loginRes = await res.json();
      dispatch(
        setAuthenticated({
          authUser: loginRes.user,
          apiToken: loginRes.token || '',
        })
      );
      toast.success('Login Success', {
        description: `Selamat datang ${loginRes.user.name}`,
      });

      router.replace('/');
    } catch (err) {
      toast.error('Error', { description: 'login gagal. terjadi kesalahan' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-2xl font-bold'>Login ke akun Anda</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            Masukan email dan password untuk login
          </p>
        </div>
        <div className='grid gap-6'>
          {/* <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='m@example.com' required /> */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  {...field}
                  ref={emailRef}
                  className={cn(
                    form.formState.errors?.email
                      ? 'border-[#EE1D52] focus:ring-[#EE1D52]'
                      : ''
                  )}
                  placeholder='masukan email'
                  disabled={isLoading}
                  type='email'
                  autoComplete='username'
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <a
                  href='#'
                  className='ml-auto text-sm underline-offset-4 hover:underline'
                >
                  Lupa password?
                </a>
              </div>
              <Input id='password' type='password' required /> */}

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className='relative'>
                  <Input
                    {...field}
                    ref={passwordRef}
                    className={cn(
                      form.formState.errors?.password
                        ? 'border-[#EE1D52] focus:ring-[#EE1D52]'
                        : ''
                    )}
                    placeholder='masukkan sandi'
                    disabled={isLoading}
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    autoComplete='current-password'
                  />
                  <div className='pointer-events-auto absolute inset-y-0 right-0 flex items-center pr-3'>
                    <button
                      type='button'
                      className='focus:outline-none'
                      onClick={togglePasswordVisibility}
                    >
                      {!showPassword ? (
                        <EyeOffIcon
                          className='h-5 w-5 text-gray-400'
                          aria-hidden='true'
                        />
                      ) : (
                        <EyeIcon
                          className='h-5 w-5 text-gray-400'
                          aria-hidden='true'
                        />
                      )}
                    </button>
                  </div>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type='submit' className='w-full'>
            {isLoading ? (
              <BeatLoader color='#d5d7da' className='text-white' size={16} />
            ) : (
              'Login'
            )}
          </Button>
          <div className='after:border-border relative hidden text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
            <span className='bg-background text-muted-foreground relative z-10 px-2'>
              Or continue with
            </span>
          </div>
          <Button variant='outline' className='hidden w-full'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
              <path
                d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
                fill='currentColor'
              />
            </svg>
            Login with GitHub
          </Button>
        </div>
        <div className='hidden text-center text-sm'>
          Don&apos;t have an account?{' '}
          <a href='#' className='underline underline-offset-4'>
            Sign up
          </a>
        </div>
      </form>
    </Form>
  );
}
