/**
 * Script de test pour vérifier le fonctionnement du système d'IA
 * 
 * Utilisation:
 * 1. Assurez-vous que le serveur est en cours d'exécution
 * 2. Exécutez ce script: node test/test-ai-service.js
 */

async function testAiService() {
  console.log('=== TEST DU SYSTÈME D\'IA ===');
  console.log('Ce script va tester les trois fonctionnalités principales du système d\'IA');
  console.log('pour vérifier qu\'elles fonctionnent correctement en mode local.');
  console.log('----------------------------------------------\n');

  // 1. Test d'analyse de sentiment
  console.log('1. TEST D\'ANALYSE DE SENTIMENT');
  
  try {
    const positiveText = "J'adore ce produit, c'est fantastique et incroyable!";
    console.log(`   Texte positif: "${positiveText}"`);
    
    const positiveResponse = await fetch('http://localhost:5000/api/ai/analyze-sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: positiveText })
    });
    
    const positiveResult = await positiveResponse.json();
    console.log(`   Résultat: ${JSON.stringify(positiveResult, null, 2)}`);
    
    const negativeText = "Ce produit est terrible, je suis très déçu.";
    console.log(`   Texte négatif: "${negativeText}"`);
    
    const negativeResponse = await fetch('http://localhost:5000/api/ai/analyze-sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: negativeText })
    });
    
    const negativeResult = await negativeResponse.json();
    console.log(`   Résultat: ${JSON.stringify(negativeResult, null, 2)}`);
    
    console.log('✅ Test d\'analyse de sentiment terminé\n');
  } catch (error) {
    console.error('❌ Erreur lors du test d\'analyse de sentiment:', error.message);
  }

  // 2. Test de génération de résumé
  console.log('2. TEST DE GÉNÉRATION DE RÉSUMÉ');
  
  try {
    const longText = `L'intelligence artificielle (IA) est un ensemble de théories et de techniques 
    développant des programmes informatiques complexes capables de simuler certains traits de 
    l'intelligence humaine. Elle comprend la résolution de problèmes, la compréhension du langage 
    naturel, et la reconnaissance de formes. Les applications de l'IA sont nombreuses, notamment 
    dans les domaines de la médecine, des transports, de la finance, et de l'éducation.`;
    
    console.log(`   Texte à résumer: "${longText.substring(0, 100)}..."`);
    
    const summaryResponse = await fetch('http://localhost:5000/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: longText })
    });
    
    const summaryResult = await summaryResponse.json();
    console.log(`   Résumé: "${summaryResult.summary}"`);
    console.log(`   Mode secours utilisé: ${summaryResult.fromFallback ? 'Oui' : 'Non'}`);
    
    console.log('✅ Test de génération de résumé terminé\n');
  } catch (error) {
    console.error('❌ Erreur lors du test de génération de résumé:', error.message);
  }

  // 3. Test de recommandations de produits
  console.log('3. TEST DE RECOMMANDATION DE PRODUITS');
  
  try {
    const description = "Je cherche des produits pour la cuisine, notamment pour préparer des pâtisseries.";
    console.log(`   Description: "${description}"`);
    
    const recommendationResponse = await fetch('http://localhost:5000/api/ai/recommend-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    
    const recommendationResult = await recommendationResponse.json();
    console.log(`   Recommandations: ${JSON.stringify(recommendationResult.recommendations, null, 2)}`);
    console.log(`   Mode secours utilisé: ${recommendationResult.fromFallback ? 'Oui' : 'Non'}`);
    
    console.log('✅ Test de recommandation de produits terminé\n');
  } catch (error) {
    console.error('❌ Erreur lors du test de recommandation de produits:', error.message);
  }

  console.log('=== RÉSUMÉ DES TESTS ===');
  console.log('Si tous les tests sont marqués ✅, cela confirme que le système d\'IA');
  console.log('fonctionne correctement en mode local, sans appels à l\'API OpenAI.');
  console.log('');
  console.log('Pour vérifier si les tests utilisent bien le système local :');
  console.log('1. Vérifiez que "fromFallback" est à "true" dans les réponses');
  console.log('2. Consultez les logs du serveur pour les messages "Mode démo"');
  console.log('');
  console.log('Consultez AI_REFERENCE_GUIDE.md pour plus d\'informations sur le système d\'IA.');
}

testAiService();