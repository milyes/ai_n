import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpTooltip, ContextualHelp } from "@/components/ui/help-tooltip";
import { useHelp } from "@/lib/help-context";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, HelpCircleIcon, AlertTriangleIcon, BookOpenIcon, ArrowRightCircleIcon, CheckCircleIcon } from "lucide-react";

export default function HelpPage() {
  const { showHelp, dismissAllHelp, isHelpEnabled, toggleHelpEnabled } = useHelp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contextual");
  
  // Afficher une bulle d'aide de bienvenue au chargement de la page
  useEffect(() => {
    if (isHelpEnabled) {
      const welcomeHelpId = showHelp({
        title: "Bienvenue dans le Centre d'Aide",
        description: "Explorez les différentes fonctionnalités d'aide disponibles dans notre application. Cette page vous montre comment utiliser notre système d'aide contextuelle.",
        position: "bottom-right",
        showAcknowledge: true,
        autoHide: false
      });
      
      return () => dismissAllHelp();
    }
  }, [showHelp, dismissAllHelp, isHelpEnabled]);

  const handleShowTooltipDemo = () => {
    toast({
      title: "Information",
      description: "Les infobulles apparaissent au survol des éléments avec icônes d'aide.",
    });
  };

  const handleShowFloatingHelp = (position: "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
    showHelp({
      id: `demo-help-${position}`,
      title: `Aide flottante (${position})`,
      description: "Ceci est une démonstration d'une bulle d'aide flottante qui peut être placée à différentes positions sur l'écran.",
      position: position,
      showDismiss: true,
      showAcknowledge: true,
      autoHide: true,
      autoHideDelay: 5000
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Centre d'Aide Contextuelle</h1>
          <p className="text-muted-foreground mb-4">
            Découvrez comment utiliser notre système d'aide contextuelle pour naviguer efficacement dans l'application.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="help-toggle" 
            checked={isHelpEnabled} 
            onCheckedChange={toggleHelpEnabled} 
          />
          <Label htmlFor="help-toggle">Activer l'aide contextuelle</Label>
          <HelpTooltip 
            content="Active ou désactive toutes les bulles d'aide contextuelle dans l'application"
            type="help"
          />
        </div>
      </div>

      <Tabs defaultValue="contextual" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="contextual">Aide Contextuelle</TabsTrigger>
          <TabsTrigger value="tooltips">Infobulles</TabsTrigger>
          <TabsTrigger value="floating">Bulles Flottantes</TabsTrigger>
          <TabsTrigger value="guided">Guides Interactifs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contextual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpenIcon className="mr-2 h-5 w-5 text-primary" />
                Aide Contextuelle
              </CardTitle>
              <CardDescription>
                Notre système d'aide contextuelle s'adapte à votre utilisation de l'application pour vous fournir l'assistance dont vous avez besoin, quand vous en avez besoin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">Fonctionnalités Principales</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Aide adaptée au contexte de navigation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Infobulles sur les éléments complexes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Bulles d'aide pour les nouveautés</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Guides interactifs pour les fonctionnalités avancées</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Exemple d'utilisation</h3>
                  <p className="mb-4">
                    Survolez les éléments avec une icône d'information{" "}
                    <ContextualHelp
                      content="Ceci est un exemple d'aide contextuelle attachée à un élément"
                      type="info"
                    >
                      <span className="font-medium">comme celle-ci</span>
                    </ContextualHelp>{" "}
                    pour obtenir plus d'informations.
                  </p>
                  <div className="flex flex-col gap-4 mt-4">
                    <Button onClick={handleShowTooltipDemo}>
                      Voir démonstration
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tooltips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <InfoIcon className="mr-2 h-5 w-5 text-blue-500" />
                Types d'Infobulles
              </CardTitle>
              <CardDescription>
                Différents types d'infobulles sont disponibles pour fournir des informations contextuelles de différentes natures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="mb-4">
                    <HelpTooltip
                      content="Fournit des informations supplémentaires sur une fonctionnalité"
                      type="info"
                      iconSize={24}
                    />
                  </div>
                  <h3 className="text-lg font-medium">Information</h3>
                  <p className="text-center text-sm mt-2">
                    Informations complémentaires et contextuelles
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="mb-4">
                    <HelpTooltip
                      content="Explique comment utiliser une fonctionnalité particulière"
                      type="help"
                      iconSize={24}
                    />
                  </div>
                  <h3 className="text-lg font-medium">Aide</h3>
                  <p className="text-center text-sm mt-2">
                    Instructions et conseils d'utilisation
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="mb-4">
                    <HelpTooltip
                      content="Attire l'attention sur des points importants à considérer"
                      type="warning"
                      iconSize={24}
                    />
                  </div>
                  <h3 className="text-lg font-medium">Avertissement</h3>
                  <p className="text-center text-sm mt-2">
                    Points d'attention et précautions
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">Exemple d'utilisation</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="api-key" className="w-24">Clé API</Label>
                    <Input
                      id="api-key"
                      type="text"
                      placeholder="Entrez votre clé API"
                      className="flex-1"
                    />
                    <HelpTooltip
                      content={
                        <div className="space-y-2">
                          <p>Votre clé API personnelle est nécessaire pour accéder aux services.</p>
                          <p>Vous pouvez l'obtenir dans les paramètres de votre compte.</p>
                        </div>
                      }
                      type="help"
                      interactive={true}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="server-url" className="w-24">URL Serveur</Label>
                    <Input
                      id="server-url"
                      type="text"
                      placeholder="https://api.example.com"
                      className="flex-1"
                    />
                    <HelpTooltip
                      content="L'URL du serveur API auquel se connecter"
                      type="info"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="floating" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircleIcon className="mr-2 h-5 w-5 text-primary" />
                Bulles d'Aide Flottantes
              </CardTitle>
              <CardDescription>
                Les bulles d'aide flottantes apparaissent automatiquement pour signaler des informations importantes ou des nouvelles fonctionnalités.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Positionnement</h3>
                  <p>
                    Les bulles d'aide peuvent être positionnées à différents endroits de l'écran selon le contexte et l'importance de l'information.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleShowFloatingHelp("top-left")}
                    >
                      En haut à gauche
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleShowFloatingHelp("top-right")}
                    >
                      En haut à droite
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleShowFloatingHelp("bottom-left")}
                    >
                      En bas à gauche
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleShowFloatingHelp("bottom-right")}
                    >
                      En bas à droite
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Comportement</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ArrowRightCircleIcon className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Apparaissent automatiquement lors de la découverte de nouvelles fonctionnalités</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRightCircleIcon className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Peuvent se fermer automatiquement après un certain délai</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRightCircleIcon className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Mémorisent les informations déjà vues pour ne pas les réafficher</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRightCircleIcon className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Peuvent contenir des boutons d'action ou de confirmation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guided" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangleIcon className="mr-2 h-5 w-5 text-amber-500" />
                Guides Interactifs
              </CardTitle>
              <CardDescription>
                Les guides interactifs vous accompagnent pas à pas dans la réalisation d'une tâche complexe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p>
                  Cette fonctionnalité sera bientôt disponible. Les guides interactifs vous permettront de découvrir les fonctionnalités avancées de l'application à travers des parcours guidés interactifs.
                </p>
              </div>
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Fonctionnalité à venir",
                      description: "Les guides interactifs seront disponibles dans une prochaine mise à jour.",
                    });
                  }}
                >
                  Essayer les guides (bientôt disponible)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}