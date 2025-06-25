"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { toast } from "sonner";

const formSchema = z.object({
  login: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    const { login, password } = values;

    try {
      let email = login;

      if (!login.includes("@")) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("username", login)
          .single();

        if (userError || !user) {
          form.setError("login", { message: "Username not found" });
          return;
        }

        email = user.email;
      }

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        form.setError("root", { message: signInError.message });
        return;
      }

      if (authData.session) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("username")
          .eq("id", authData.session.user.id)
          .single();

        if (!profileError && profile) {
          toast.success(`Signed in successfully as ${profile.username}!`);
        }
        router.push("/dashboard");
      } else {
        form.setError("root", { message: "Sign-in failed. Please try again." });
      }
    } catch (error: any) {
      form.setError("root", {
        message: error.message || "An unexpected error occurred",
      });
    }
  };

  const handleGitHubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });

    if (error) {
      form.setError("root", { message: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl text-center font-bold text-foreground mb-12">
          Sign In
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Username or Email"
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Password"
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-red-500">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-blue-700"
            >
              Sign In
            </Button>
          </form>
        </Form>
        <div className="flex items-center justify-center my-12">
          <div className="border-t border-zinc-300 dark:border-zinc-600 flex-grow"></div>
          <span className="mx-4 text-md text-zinc-700 dark:text-zinc-300">
            or
          </span>
          <div className="border-t border-zinc-300 dark:border-zinc-600 flex-grow"></div>
        </div>
        <Button
          className="w-full text-zinc-700 border border-zinc-300 bg-zinc-200 hover:bg-zinc-600 hover:text-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:border-zinc-600 cursor-pointer"
          onClick={handleGitHubSignIn}
        >
          <FontAwesomeIcon icon={faGithub} className="mr-2" /> Sign In with
          GitHub
        </Button>
        <p className="mt-8 text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary hover:underline hover:font-bold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
