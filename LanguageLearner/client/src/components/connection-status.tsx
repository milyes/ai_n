import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VpnConnection } from "@shared/schema";
import { Wifi, WifiOff } from "lucide-react";

export default function ConnectionStatus() {
  const { data: status } = useQuery<VpnConnection>({
    queryKey: ["/api/vpn/status"],
  });

  const isConnected = status?.status === "connected";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {isConnected ? (
            <Wifi className="h-8 w-8 text-green-500" />
          ) : (
            <WifiOff className="h-8 w-8 text-red-500" />
          )}
          <div>
            <div className="text-lg font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            {status?.bandwidth && (
              <div className="text-sm text-muted-foreground">
                Bandwidth: {status.bandwidth} Mbps
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
