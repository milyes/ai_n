import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings } from "lucide-react";

export default function VpnConfig() {
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("POST", "/api/vpn/status", { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vpn/status"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>VPN Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Server Address</Label>
            <Input placeholder="vpn.example.com" />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input placeholder="1194" />
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => updateStatusMutation.mutate("connected")}
              className="flex-1"
            >
              <Settings className="mr-2 h-4 w-4" />
              Connect
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatusMutation.mutate("disconnected")}
              className="flex-1"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
