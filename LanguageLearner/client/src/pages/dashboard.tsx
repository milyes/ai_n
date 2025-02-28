import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ConnectionStatus from "@/components/connection-status";
import ApiKeyManager from "@/components/api-key-manager";
import VpnConfig from "@/components/vpn-config";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">VPN Manager</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <ConnectionStatus />
          <VpnConfig />
          <div className="md:col-span-2">
            <ApiKeyManager />
          </div>
        </div>
      </main>
    </div>
  );
}
