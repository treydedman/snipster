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
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    const { email, username, password } = values;

    try {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (userError) {
        console.error("Username check error:", userError);
        form.setError("username", {
          message: "Error checking username availability. Please try again.",
        });
        return;
      }

      if (existingUser) {
        form.setError("username", { message: "Username is already taken" });
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { preferred_username: username } },
      });

      if (authError) {
        form.setError("root", { message: authError.message });
        return;
      }

      if (authData.user && !authData.user.confirmed_at) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          form.setError("root", { message: "Failed to auto-login" });
          return;
        }
      }

      if (authData.user) {
        toast.success("Sign-up successful!");
        router.push("/dashboard");
      } else {
        form.setError("root", { message: "Sign-up failed. Please try again." });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Sign-up error:", error);
      form.setError("root", { message });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl text-center font-bold text-foreground mb-12">
          Sign Up
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
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
