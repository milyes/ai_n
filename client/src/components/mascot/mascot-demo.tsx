import React, { useState } from 'react';
import { MascotAnimation, MascotState, MascotSize } from './mascot-animation';
import { MascotLoader, LoadingPhase } from './mascot-loader';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Composant de démonstration de la mascotte
 * Affiche les différents états et configurations de la mascotte
 */
export function MascotDemo() {
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [mascotSize, setMascotSize] = useState<MascotSize>("md");
  const [mascotMessage, setMascotMessage] = useState<string>("");
  const [loaderPhase, setLoaderPhase] = useState<LoadingPhase>("loading");
  const [loaderMessage, setLoaderMessage] = useState<string>("");
  const [showFunMessages, setShowFunMessages] = useState<boolean>(true);
  const [loopAnimation, setLoopAnimation] = useState<boolean>(true);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  
  // Options pour les états de la mascotte
  const mascotStateOptions: {label: string, value: MascotState}[] = [
    { label: "Au repos", value: "idle" },
    { label: "Salutation", value: "greeting" },
    { label: "Travail", value: "working" },
    { label: "Réflexion", value: "thinking" },
    { label: "Succès", value: "success" },
    { label: "Erreur", value: "error" },
    { label: "En veille", value: "sleeping" },
    { label: "Excité", value: "excited" }
  ];
  
  // Options pour les tailles de la mascotte
  const mascotSizeOptions: {label: string, value: MascotSize}[] = [
    { label: "Très petite", value: "xs" },
    { label: "Petite", value: "sm" },
    { label: "Moyenne", value: "md" },
    { label: "Grande", value: "lg" },
    { label: "Très grande", value: "xl" }
  ];
  
  // Options pour les phases du loader
  const loaderPhaseOptions: {label: string, value: LoadingPhase}[] = [
    { label: "Initialisation", value: "initial" },
    { label: "Chargement", value: "loading" },
    { label: "Traitement", value: "processing" },
    { label: "Finalisation", value: "finalizing" },
    { label: "Erreur", value: "error" },
    { label: "Succès", value: "success" }
  ];
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Démonstration de NetBot</h1>
      
      <Tabs defaultValue="mascot" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mascot">Mascotte</TabsTrigger>
          <TabsTrigger value="loader">Chargement</TabsTrigger>
        </TabsList>
        
        {/* Onglet Mascotte */}
        <TabsContent value="mascot">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Personnalisez l'apparence et le comportement de la mascotte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>État</Label>
                  <Select
                    value={mascotState}
                    onValueChange={(value) => setMascotState(value as MascotState)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un état" />
                    </SelectTrigger>
                    <SelectContent>
                      {mascotStateOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Select
                    value={mascotSize}
                    onValueChange={(value) => setMascotSize(value as MascotSize)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      {mascotSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Input 
                    value={mascotMessage}
                    onChange={(e) => setMascotMessage(e.target.value)}
                    placeholder="Message à afficher"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setMascotState("greeting")}
                  className="w-full"
                >
                  Animation de salutation
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Visualisez la mascotte avec les paramètres définis</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                <MascotAnimation 
                  state={mascotState}
                  size={mascotSize}
                  message={mascotMessage || undefined}
                  loop={true}
                  clickable={true}
                  onClick={() => {
                    // Cycle à travers les états
                    const currentIndex = mascotStateOptions.findIndex(o => o.value === mascotState);
                    const nextIndex = (currentIndex + 1) % mascotStateOptions.length;
                    setMascotState(mascotStateOptions[nextIndex].value);
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                Cliquez sur la mascotte pour changer d'état
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Onglet Loader */}
        <TabsContent value="loader">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Personnalisez le chargement avec mascotte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select
                    value={loaderPhase}
                    onValueChange={(value) => setLoaderPhase(value as LoadingPhase)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {loaderPhaseOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Select
                    value={mascotSize}
                    onValueChange={(value) => setMascotSize(value as MascotSize)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      {mascotSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Message personnalisé</Label>
                  <Input 
                    value={loaderMessage}
                    onChange={(e) => setLoaderMessage(e.target.value)}
                    placeholder="Laissez vide pour messages par défaut"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="fun-messages">Messages amusants</Label>
                  <Switch 
                    id="fun-messages" 
                    checked={showFunMessages}
                    onCheckedChange={setShowFunMessages}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="loop-animation">Animation en boucle</Label>
                  <Switch 
                    id="loop-animation" 
                    checked={loopAnimation}
                    onCheckedChange={setLoopAnimation}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-overlay">Afficher en overlay</Label>
                  <Switch 
                    id="show-overlay" 
                    checked={showOverlay}
                    onCheckedChange={setShowOverlay}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    // Cycle à travers les phases
                    const currentIndex = loaderPhaseOptions.findIndex(o => o.value === loaderPhase);
                    const nextIndex = (currentIndex + 1) % loaderPhaseOptions.length;
                    setLoaderPhase(loaderPhaseOptions[nextIndex].value);
                  }}
                  className="w-full"
                >
                  Changer de phase
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Aperçu du chargement</CardTitle>
                <CardDescription>Visualisez le chargement avec les paramètres définis</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                {showOverlay ? (
                  <Button onClick={() => setShowOverlay(true)}>
                    Montrer le loader en overlay
                  </Button>
                ) : (
                  <MascotLoader 
                    phase={loaderPhase}
                    text={loaderMessage || undefined}
                    size={mascotSize}
                    loop={loopAnimation}
                    funMessages={showFunMessages}
                    overlay={false}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                Testez différentes configurations de chargement
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {showOverlay && (
        <MascotLoader 
          phase={loaderPhase}
          text={loaderMessage || undefined}
          size={mascotSize}
          loop={loopAnimation}
          funMessages={showFunMessages}
          overlay={true}
          onAnimationComplete={() => {
            if (!loopAnimation) {
              setTimeout(() => setShowOverlay(false), 1000);
            }
          }}
        />
      )}
    </div>
  );
}