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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons"; // Import the GitHub icon

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUp() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    const { email, password, username } = values;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      form.setError("root", { message: authError.message });
    } else {
      // Create user profile
      const { error: profileError } = await supabase
        .from("users")
        .insert({ id: data.user.id, username });

      if (profileError) {
        form.setError("root", { message: profileError.message });
      } else {
        // Create default folder
        const { error: folderError } = await supabase
          .from("folders")
          .insert({ owner: data.user.id, name: "Inbox" });

        if (folderError) {
          form.setError("root", { message: folderError.message });
        } else {
          router.push("/auth/sign-in");
        }
      }
    }
  };

  const handleGitHubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // Adjust for production
      },
    });

    if (error) {
      form.setError("root", { message: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl text-center font-bold text-foreground mb-12">
          Create an Account
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="username"
                      placeholder="Username"
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email"
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
              Sign Up
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
          <FontAwesomeIcon icon={faGithub} className="mr-2" /> Sign Up with
          GitHub
        </Button>
        <p className="mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-primary hover:underline hover:font-bold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
