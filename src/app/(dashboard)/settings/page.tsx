import React from "react";
import { Settings, Shield, Bell, Key, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500">
          Organization preferences, API credentials, and notification settings for Brightloop.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">API Keys & Webhooks</CardTitle>
            </div>
            <CardDescription>
              Configure webhook endpoints for Stripe and external billing systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Webhook signing secret and test keys will be configured in Phase 2.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">PostgreSQL Connection</CardTitle>
            </div>
            <CardDescription>
              Database pooling, migrations, and Prisma ORM configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Database schema and connection pooling will be activated in Phase 1.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
