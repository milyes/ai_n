import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiKey } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2, Key, Trash2 } from "lucide-react";

export default function ApiKeyManager() {
  const { toast } = useToast();
  const [newKeyName, setNewKeyName] = useState("");

  const { data: keys } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/keys", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setNewKeyName("");
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Deactivated",
        description: "The API key has been deactivated successfully.",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button
            onClick={() => createKeyMutation.mutate(newKeyName)}
            disabled={!newKeyName || createKeyMutation.isPending}
          >
            {createKeyMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Key
          </Button>
        </div>

        <div className="space-y-4">
          {keys?.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{key.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteKeyMutation.mutate(key.id)}
                disabled={!key.active || deleteKeyMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
