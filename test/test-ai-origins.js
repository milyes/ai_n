/**
 * Script de test pour vérifier le fonctionnement du système d'IA avec origines multiples
 * 
 * Utilisation:
 * 1. Assurez-vous que le serveur est en cours d'exécution
 * 2. Exécutez ce script: node test/test-ai-origins.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Texte de test
const TEST_TEXT = "Je suis très satisfait de ce produit, il fonctionne parfaitement bien. L'interface est intuitive et agréable à utiliser. Je le recommande vivement!";
const TEST_DESCRIPTION = "Je recherche un smartphone avec une bonne qualité photo, une bonne autonomie et un design élégant. Mon budget est d'environ 800€.";

// Fonction pour tester l'analyse de sentiment avec différentes origines
async function testSentimentAnalysis() {
  console.log('\n=== Test d\'analyse de sentiment avec différentes origines ===');
  
  // Tester avec chaque origine disponible
  const origins = ['auto', 'local', 'openai', 'xai'];
  
  for (const origin of origins) {
    try {
      console.log(`\nTest avec origine: ${origin}`);
      
      const response = await fetch(`${API_URL}/ai/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: TEST_TEXT, origin })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Succès! Rating: ${result.data.rating}/5, Confiance: ${result.data.confidence.toFixed(2)}`);
        console.log(`📊 Origine utilisée: ${result.data.origin}`);
        if (result.warning) {
          console.log(`⚠️ Avertissement: ${result.warning}`);
        }
      } else {
        console.log(`❌ Échec: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
}

// Fonction pour tester la génération de résumé avec différentes origines
async function testSummarization() {
  console.log('\n=== Test de génération de résumé avec différentes origines ===');
  
  // Tester avec chaque origine disponible
  const origins = ['auto', 'local', 'openai', 'xai'];
  
  for (const origin of origins) {
    try {
      console.log(`\nTest avec origine: ${origin}`);
      
      const response = await fetch(`${API_URL}/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: TEST_TEXT.repeat(10), // Répéter pour avoir un texte plus long
          origin 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Succès! Résumé: "${result.data.summary}"`);
        console.log(`📊 Origine utilisée: ${result.data.origin}`);
        if (result.warning) {
          console.log(`⚠️ Avertissement: ${result.warning}`);
        }
      } else {
        console.log(`❌ Échec: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
}

// Fonction pour tester les recommandations de produits avec différentes origines
async function testRecommendations() {
  console.log('\n=== Test de génération de recommandations avec différentes origines ===');
  
  // Tester avec chaque origine disponible
  const origins = ['auto', 'local', 'openai', 'xai'];
  
  for (const origin of origins) {
    try {
      console.log(`\nTest avec origine: ${origin}`);
      
      const response = await fetch(`${API_URL}/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: TEST_DESCRIPTION, origin })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Succès! Recommandations: `);
        result.data.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
        console.log(`📊 Origine utilisée: ${result.data.origin}`);
        if (result.warning) {
          console.log(`⚠️ Avertissement: ${result.warning}`);
        }
      } else {
        console.log(`❌ Échec: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
}

// Fonction pour tester la configuration de l'origine par défaut
async function testOriginConfiguration() {
  console.log('\n=== Test de configuration de l\'origine par défaut ===');
  
  // Obtenir la configuration actuelle
  try {
    console.log('\nObtention de la configuration actuelle:');
    
    const response = await fetch(`${API_URL}/ai/config/origin`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Origine actuelle: ${result.data.origin} (${result.data.name})`);
      console.log(`📝 Description: ${result.data.description}`);
    } else {
      console.log(`❌ Échec: ${result.message}`);
    }
    
    // Tester chaque origine disponible
    const origins = ['auto', 'local', 'openai', 'xai'];
    
    for (const origin of origins) {
      console.log(`\nChangement de l'origine par défaut vers: ${origin}`);
      
      const setResponse = await fetch(`${API_URL}/ai/config/origin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin })
      });
      
      const setResult = await setResponse.json();
      
      if (setResult.success) {
        console.log(`✅ Succès! Nouvelle origine: ${setResult.data.origin} (${setResult.data.name})`);
        console.log(`📝 Description: ${setResult.data.description}`);
        
        // Vérifier l'analyse de sentiment avec la nouvelle origine par défaut
        console.log('\nTest d\'analyse de sentiment avec la nouvelle origine par défaut:');
        
        const testResponse = await fetch(`${API_URL}/ai/sentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: TEST_TEXT }) // Sans spécifier l'origine
        });
        
        const testResult = await testResponse.json();
        
        if (testResult.success) {
          console.log(`✅ Succès! Rating: ${testResult.data.rating}/5, Confiance: ${testResult.data.confidence.toFixed(2)}`);
          console.log(`📊 Origine utilisée: ${testResult.data.origin}`);
          if (testResult.warning) {
            console.log(`⚠️ Avertissement: ${testResult.warning}`);
          }
        } else {
          console.log(`❌ Échec: ${testResult.message}`);
        }
      } else {
        console.log(`❌ Échec: ${setResult.message}`);
      }
    }
    
    // Restaurer l'origine par défaut à "auto"
    console.log('\nRestauration de l\'origine par défaut à "auto":');
    
    const resetResponse = await fetch(`${API_URL}/ai/config/origin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'auto' })
    });
    
    const resetResult = await resetResponse.json();
    
    if (resetResult.success) {
      console.log(`✅ Succès! Origine restaurée: ${resetResult.data.origin} (${resetResult.data.name})`);
    } else {
      console.log(`❌ Échec: ${resetResult.message}`);
    }
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🔍 Démarrage des tests du système IA avec origines multiples...');
  
  try {
    // Test de configuration
    await testOriginConfiguration();
    
    // Tests des fonctionnalités
    await testSentimentAnalysis();
    await testSummarization();
    await testRecommendations();
    
    console.log('\n✨ Tous les tests sont terminés!');
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution des tests: ${error.message}`);
  }
}

// Démarrer les tests
runAllTests();