import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/use-page-title";
import { useState } from "react";
import { Link } from "wouter";
import { t, getLocale } from "@/lib/i18n";

export default function SignInPage() {
  usePageTitle("Sign In");
  const [locale] = useState(getLocale());
  const copy = t(locale);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardContent className="p-8 space-y-5">
            <div>
              <h1 className="text-3xl font-serif font-bold">{copy.auth.title}</h1>
              <p className="text-muted-foreground mt-2">{copy.auth.subtitle}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{copy.auth.email}</label>
                <Input type="email" placeholder="ahmad@example.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{copy.auth.password}</label>
                <Input type="password" placeholder="••••••••" className="mt-1" />
              </div>
            </div>
            <Button className="w-full">{copy.auth.button}</Button>
            <p className="text-xs text-muted-foreground text-center">{copy.auth.demo}</p>
            <Link href="/" className="block text-center text-sm text-primary hover:underline">Back home</Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
