import React from 'react';
import { EndpointCard } from '@/components/api/endpoint-card';

export default function Endpoints() {
  return (
    <>
      <section id="endpoints-users" className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Points de terminaison - Utilisateurs</h2>
        
        <EndpointCard
          method="GET"
          path="/api/users"
          statusCode="200"
          statusText="OK"
          description="Récupérer tous les utilisateurs"
          responseExample={`{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "username": "jean_dupont",
      "email": "jean@example.com",
      "role": "user",
      "createdAt": "2021-06-22T19:12:38.491Z"
    },
    {
      "id": 2,
      "username": "marie_martin",
      "email": "marie@example.com",
      "role": "admin",
      "createdAt": "2021-06-22T19:12:38.491Z"
    }
  ]
}`}
        />
        
        <EndpointCard
          method="GET"
          path="/api/users/:id"
          statusCode="200"
          statusText="OK"
          description="Récupérer un utilisateur par ID"
          responseExample={`{
  "success": true,
  "data": {
    "id": 1,
    "username": "jean_dupont",
    "email": "jean@example.com",
    "role": "user",
    "createdAt": "2021-06-22T19:12:38.491Z"
  }
}`}
        />
        
        <EndpointCard
          method="POST"
          path="/api/users"
          statusCode="201"
          statusText="Created"
          description="Créer un nouvel utilisateur"
          requestExample={`{
  "username": "pierre_dubois",
  "email": "pierre@example.com",
  "password": "secret123",
  "role": "user"
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": 3,
    "username": "pierre_dubois",
    "email": "pierre@example.com",
    "role": "user",
    "createdAt": "2021-06-23T10:15:12.491Z"
  }
}`}
        />
        
        <EndpointCard
          method="PUT"
          path="/api/users/:id"
          statusCode="200"
          statusText="OK"
          description="Mettre à jour un utilisateur existant"
          requestExample={`{
  "email": "pierre.updated@example.com"
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": 3,
    "username": "pierre_dubois",
    "email": "pierre.updated@example.com",
    "role": "user",
    "createdAt": "2021-06-23T10:15:12.491Z"
  }
}`}
        />
        
        <EndpointCard
          method="DELETE"
          path="/api/users/:id"
          statusCode="200"
          statusText="OK"
          description="Supprimer un utilisateur"
          responseExample={`{
  "success": true,
  "data": {}
}`}
        />
      </section>

      <section id="endpoints-products" className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Points de terminaison - Produits</h2>
        
        <EndpointCard
          method="GET"
          path="/api/products"
          statusCode="200"
          statusText="OK"
          description="Récupérer tous les produits"
          responseExample={`{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Smartphone XYZ",
      "description": "Un smartphone de haute qualité",
      "price": 499.99,
      "category": "Électronique",
      "inStock": true
    },
    {
      "id": 2,
      "name": "Ordinateur portable ABC",
      "description": "Un ordinateur léger et puissant",
      "price": 899.99,
      "category": "Informatique",
      "inStock": true
    }
  ]
}`}
        />
        
        <EndpointCard
          method="GET"
          path="/api/products/:id"
          statusCode="200"
          statusText="OK"
          description="Récupérer un produit par ID"
          responseExample={`{
  "success": true,
  "data": {
    "id": 1,
    "name": "Smartphone XYZ",
    "description": "Un smartphone de haute qualité",
    "price": 499.99,
    "category": "Électronique",
    "inStock": true
  }
}`}
        />
        
        <EndpointCard
          method="POST"
          path="/api/products"
          statusCode="201"
          statusText="Created"
          description="Créer un nouveau produit"
          requestExample={`{
  "name": "Tablette 10 pouces",
  "description": "Tablette tactile haute résolution",
  "price": 299.99,
  "category": "Électronique",
  "inStock": true
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": 3,
    "name": "Tablette 10 pouces",
    "description": "Tablette tactile haute résolution",
    "price": 299.99,
    "category": "Électronique",
    "inStock": true
  }
}`}
        />
      </section>

      <section id="endpoints-orders" className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Points de terminaison - Commandes</h2>
        
        <EndpointCard
          method="GET"
          path="/api/orders"
          statusCode="200"
          statusText="OK"
          description="Récupérer toutes les commandes"
          responseExample={`{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "jean_dupont"
      },
      "products": [
        {
          "id": 1,
          "name": "Smartphone XYZ",
          "price": 499.99,
          "quantity": 1
        }
      ],
      "totalAmount": 499.99,
      "status": "completed",
      "createdAt": "2021-07-01T10:30:00.000Z"
    }
  ]
}`}
        />
        
        <EndpointCard
          method="POST"
          path="/api/orders"
          statusCode="201"
          statusText="Created"
          description="Créer une nouvelle commande"
          requestExample={`{
  "userId": 1,
  "products": [
    {
      "id": 2,
      "quantity": 1
    }
  ]
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": 2,
    "user": {
      "id": 1,
      "username": "jean_dupont"
    },
    "products": [
      {
        "id": 2,
        "name": "Ordinateur portable ABC",
        "price": 899.99,
        "quantity": 1
      }
    ],
    "totalAmount": 899.99,
    "status": "pending",
    "createdAt": "2021-07-03T15:45:22.000Z"
  }
}`}
        />
      </section>
    </>
  );
}
