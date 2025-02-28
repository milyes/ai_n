import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';

export default function Validation() {
  return (
    <section id="validation" className="mb-12">
      <h2 className="text-2xl font-medium text-gray-900 mb-4">Validation des données</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">L'API utilise la bibliothèque <strong>Zod</strong> pour valider toutes les données entrantes. Voici les schémas de validation pour les principales ressources :</p>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Validation des utilisateurs</h3>
        <CodeBlock language="typescript">
{`const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).default('user')
});`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Validation des produits</h3>
        <CodeBlock language="typescript">
{`const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  category: z.string(),
  inStock: z.boolean().default(true)
});`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Validation des commandes</h3>
        <CodeBlock language="typescript">
{`const orderSchema = z.object({
  userId: z.number().positive(),
  products: z.array(
    z.object({
      id: z.number().positive(),
      quantity: z.number().positive().default(1)
    })
  )
});`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Implémentation</h3>
        <p>Chaque point d'entrée qui accepte des données utilise un middleware de validation :</p>
        <CodeBlock language="typescript">
{`// Middleware de validation 
const validate = (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    const zodError = error as z.ZodError;
    return res.status(400).json({
      success: false,
      error: zodError.errors[0].message
    });
  }
};

// Utilisation dans les routes
router.post('/api/users', validate(userSchema), userController.createUser);`}
        </CodeBlock>
      </div>
    </section>
  );
}
