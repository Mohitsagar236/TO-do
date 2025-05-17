import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { AuthChangeEvent } from '@supabase/supabase-js';

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Check initial session
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigate('/', { replace: true });
      }
    });
  }, [navigate, setUser]);
  // Handle auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (event === 'SIGNED_IN' as AuthChangeEvent) {
        setUser(session?.user ?? null);
        navigate('/', { replace: true });
        toast.success('Logged in successfully!');
      } else if (event === 'SIGNED_OUT' as AuthChangeEvent) {
        setUser(null);
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_UP' as AuthChangeEvent) {
        if (session?.user?.identities?.[0]?.provider === 'email') {
          toast.success(
            'Please check your email for the verification link. Check your spam folder if you don\'t see it!',
            { duration: 6000 }
          );
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setUser]);

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to TaskMaster
          </h2>          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in with your social account or email
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                  messageText: '#1f2937',
                  messageTextDanger: '#991b1b',
                  inputBorder: '#e5e7eb',
                  inputBorderFocus: '#2563eb',
                  inputBorderHover: '#94a3b8'
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px'
                },
                radii: {
                  borderRadiusButton: '0.375rem',
                  buttonBorderRadius: '0.375rem',
                  inputBorderRadius: '0.375rem'
                }
              }
            },
            style: {
              container: { gap: '1rem' },
              button: { 
                height: '2.75rem',
                borderRadius: '0.375rem',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              },
              divider: { margin: '1.5rem 0' },
              input: { backgroundColor: 'transparent' },
              message: { padding: '0.75rem' }
            }
          }}
          providers={['github', 'google']}
          providerScopes={{
            github: 'read:user user:email',
            google: 'profile email'
          }}
          theme={useUserStore.getState().darkMode ? 'dark' : 'light'}
          redirectTo={`${window.location.origin}/auth/callback`}
          magicLink={false}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                social_provider_text: 'Continue with {{provider}}',
                confirmation_text: 'Check your email for the confirmation link'
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
                social_provider_text: 'Continue with {{provider}}'
              }
            }
          }}
        />
      </div>
    </div>
  );
}