
// Gestionnaire de fond d'écran avec contrôle d'activation et monitoring CPU
let originalContainer = null; // Référence au conteneur original
let cpuMonitoring = null; // Variable pour stocker l'ID de l'intervalle de monitoring
let performanceData = []; // Stockage des données de performance
let lastStartTime = 0; // Horodatage du dernier début de rendu


// /**
//  * Démarre ou arrête le monitoring CPU du fond d'écran
//  * @param {boolean} start - true pour démarrer, false pour arrêter
//  * @param {number} interval - intervalle de monitoring en ms (défaut: 1000)
//  * @returns {Object|null} - statistiques actuelles ou null si monitoring arrêté
//  */
// export function monitorBackgroundPerformance(start = true, interval = 1000) {
//   if (start) {
//     // Arrêter le monitoring existant s'il y en a un
//     if (cpuMonitoring) {
//       clearInterval(cpuMonitoring);
//     }
    
//     // Réinitialiser les données de performance
//     performanceData = [];
//     lastStartTime = performance.now();
    
//     // Configuration de l'observateur de performance
//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       for (const entry of entries) {
//         if (entry.name.includes('style') || entry.name.includes('paint') || entry.name.includes('composite')) {
//           performanceData.push({
//             time: entry.startTime,
//             duration: entry.duration,
//             type: entry.name
//           });
//         }
//       }
//     });

//     // Observer les événements de peinture et de rendu
//     observer.observe({ entryTypes: ['measure', 'paint'] });
    
//     // Patching des fonctions d'animation pour mesurer leur temps d'exécution
//     patchAnimationFunctions();
    
//     // Démarrage de l'intervalle de monitoring
//     cpuMonitoring = setInterval(() => {
//       const stats = getPerformanceStats();
//       console.log("Statistiques de performance du fond d'écran:", stats);
//     }, interval);
    
//     console.log("Monitoring de la performance du fond d'écran démarré");
//     return getPerformanceStats();
//   } else {
//     // Arrêter le monitoring
//     if (cpuMonitoring) {
//       clearInterval(cpuMonitoring);
//       cpuMonitoring = null;
      
//       // Restaurer les fonctions d'animation d'origine
//       unpatchAnimationFunctions();
      
//       console.log("Monitoring de la performance du fond d'écran arrêté");
//       return getPerformanceStats();
//     }
//     return null;
//   }
// }

// /**
//  * Récupère les statistiques de performance actuelles
//  * @returns {Object} statistiques de performance
//  */
// function getPerformanceStats() {
//   const now = performance.now();
//   const elapsedTime = now - lastStartTime;
  
//   // Si aucune donnée n'est disponible, retourner des valeurs par défaut
//   if (performanceData.length === 0) {
//     return {
//       averageDuration: 0,
//       maxDuration: 0,
//       framesPerSecond: 0,
//       totalEvents: 0,
//       cpuUsage: "faible",
//       elapsedTime
//     };
//   }
  
//   // Calculer les statistiques
//   let totalDuration = 0;
//   let maxDuration = 0;
  
//   for (const data of performanceData) {
//     totalDuration += data.duration;
//     maxDuration = Math.max(maxDuration, data.duration);
//   }
  
//   const averageDuration = totalDuration / performanceData.length;
//   const framesPerSecond = performanceData.length / (elapsedTime / 1000);
  
//   // Estimer l'utilisation CPU relative (estimation grossière)
//   let cpuUsage = "faible";
//   if (averageDuration > 5) cpuUsage = "modéré";
//   if (averageDuration > 10) cpuUsage = "élevé";
//   if (averageDuration > 16) cpuUsage = "très élevé"; // Plus de 16ms signifie des pertes de frames
  
//   return {
//     averageDuration,
//     maxDuration,
//     framesPerSecond,
//     totalEvents: performanceData.length,
//     cpuUsage,
//     elapsedTime
//   };
// }

// // Stock des fonctions originales pour les restaurer plus tard
// const originalFunctions = {
//   requestAnimationFrame: null,
//   setInterval: null,
//   setTimeout: null
// };

// /**
//  * Patch les fonctions d'animation pour mesurer leur performance
//  */
// function patchAnimationFunctions() {
//   // Sauvegarder les fonctions originales
//   originalFunctions.requestAnimationFrame = window.requestAnimationFrame;
//   originalFunctions.setInterval = window.setInterval;
//   originalFunctions.setTimeout = window.setTimeout;
  
//   // Patcher requestAnimationFrame
//   window.requestAnimationFrame = function(callback) {
//     const start = performance.now();
//     return originalFunctions.requestAnimationFrame.call(window, (timestamp) => {
//       const result = callback(timestamp);
//       const end = performance.now();
//       // Enregistrer uniquement si l'appel est lié au conteneur de fond d'écran
//       const stack = new Error().stack || '';
//       if (stack.includes('background') || stack.includes('Background')) {
//         performanceData.push({
//           time: start,
//           duration: end - start,
//           type: 'requestAnimationFrame'
//         });
//       }
//       return result;
//     });
//   };
  
//   // Pour les autres fonctions, on pourrait faire de même si nécessaire
// }

// /**
//  * Restaure les fonctions d'animation d'origine
//  */
// function unpatchAnimationFunctions() {
//   if (originalFunctions.requestAnimationFrame) {
//     window.requestAnimationFrame = originalFunctions.requestAnimationFrame;
//   }
//   if (originalFunctions.setInterval) {
//     window.setInterval = originalFunctions.setInterval;
//   }
//   if (originalFunctions.setTimeout) {
//     window.setTimeout = originalFunctions.setTimeout;
//   }
// }

// // Réexporter les fonctions du module original pour la compatibilité
// export { initBackgroundContainer, updateBackgroundImage, setupElegantBackground } from './votre-module-background';


// Version simplifiée et directe pour désactiver/activer le fond d'écran


  

  
//   /**
//    * Fonction pour surveiller la performance du fond d'écran
//    */
//   export function monitorBackgroundPerformance(start = true, interval = 1000) {
//     if (!window._perfMonitoring) {
//       window._perfMonitoring = {
//         interval: null,
//         data: [],
//         startTime: 0
//       };
//     }
    
//     const monitoring = window._perfMonitoring;
    
//     if (start) {
//       // Arrêter le monitoring existant s'il y en a un
//       if (monitoring.interval) {
//         clearInterval(monitoring.interval);
//       }
      
//       // Réinitialiser les données
//       monitoring.data = [];
//       monitoring.startTime = performance.now();
      
//       // Observer les performances de rendu
//       if (!window._perfObserver) {
//         const observer = new PerformanceObserver((list) => {
//           const entries = list.getEntries();
//           for (const entry of entries) {
//             if (entry.name.includes('style') || 
//                 entry.name.includes('paint') || 
//                 entry.name.includes('composite')) {
//               monitoring.data.push({
//                 time: entry.startTime,
//                 duration: entry.duration,
//                 type: entry.name
//               });
//             }
//           }
//         });
        
//         // Observer les événements de peinture
//         try {
//           observer.observe({ entryTypes: ['measure', 'paint'] });
//           window._perfObserver = observer;
//         } catch (e) {
//           console.error("Erreur lors de l'observation des performances:", e);
//         }
//       }
      
//       // Démarrer l'intervalle de reporting
//       monitoring.interval = setInterval(() => {
//         const stats = getPerformanceStats();
//         console.log("📊 Performance du fond d'écran:", stats);
//       }, interval);
      
//       console.log("🔍 Monitoring de performance démarré");
//       return getPerformanceStats();
//     } else {
//       // Arrêter le monitoring
//       if (monitoring.interval) {
//         clearInterval(monitoring.interval);
//         monitoring.interval = null;
        
//         if (window._perfObserver) {
//           window._perfObserver.disconnect();
//           window._perfObserver = null;
//         }
        
//         console.log("🛑 Monitoring de performance arrêté");
//         return getPerformanceStats();
//       }
//       return null;
//     }
//   }
  
//   /**
//    * Calcule les statistiques de performance
//    */
//   function getPerformanceStats() {
//     if (!window._perfMonitoring) {
//       return {
//         averageDuration: 0,
//         maxDuration: 0,
//         framesPerSecond: 0,
//         totalEvents: 0,
//         cpuUsage: "inconnu",
//         elapsedTime: 0
//       };
//     }
    
//     const monitoring = window._perfMonitoring;
//     const now = performance.now();
//     const elapsedTime = now - monitoring.startTime;
    
//     if (monitoring.data.length === 0) {
//       return {
//         averageDuration: 0,
//         maxDuration: 0,
//         framesPerSecond: 0,
//         totalEvents: 0,
//         cpuUsage: "faible",
//         elapsedTime
//       };
//     }
    
//     // Calculer les statistiques
//     let totalDuration = 0;
//     let maxDuration = 0;
    
//     for (const data of monitoring.data) {
//       totalDuration += data.duration;
//       maxDuration = Math.max(maxDuration, data.duration);
//     }
    
//     const averageDuration = totalDuration / monitoring.data.length;
//     const framesPerSecond = (monitoring.data.length / (elapsedTime / 1000)).toFixed(2);
    
//     // Estimer l'utilisation CPU
//     let cpuUsage = "faible";
//     if (averageDuration > 5) cpuUsage = "modéré";
//     if (averageDuration > 10) cpuUsage = "élevé";
//     if (averageDuration > 16) cpuUsage = "très élevé";
    
//     return {
//       averageDuration: averageDuration.toFixed(2) + " ms",
//       maxDuration: maxDuration.toFixed(2) + " ms",
//       framesPerSecond,
//       totalEvents: monitoring.data.length,
//       cpuUsage,
//       elapsedTime: (elapsedTime / 1000).toFixed(2) + " s"
//     };
//   }





  /**
 * Utilitaire pour monitorer les performances d'une fonction
 */
  export class performanceMonitor {
    constructor(name) {
      this.name = name;
      this.measurements = [];
      this.isMonitoring = false;
      this.intervalId = null;
      this.startTime = 0;
    }
    
    measure(fn, ...args) {
      const start = performance.now();
      try {
        const result = fn(...args);
        const end = performance.now();
        this.addMeasurement(end - start);
        return result;
      } catch (err) {
        const end = performance.now();
        this.addMeasurement(end - start, true);
        throw err;
      }
    }
    
    wrapFunction(fn) {
      const monitor = this;
      return function(...args) {
        return monitor.measure(() => fn.apply(this, args));
      };
    }
    
    addMeasurement(duration, isError = false) {
      this.measurements.push({
        time: performance.now() - this.startTime,
        duration,
        isError
      });
    }
    
    start(interval = 1000) {
      this.isMonitoring = true;
      this.measurements = [];
      this.startTime = performance.now();
      
      console.log(`Monitoring de ${this.name} démarré`);
      
      this.intervalId = setInterval(() => {
        console.log(`📊 Performance de ${this.name}:`, this.getStats());
      }, interval);
      
      return this;
    }
    
    stop() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isMonitoring = false;
      
      const stats = this.getStats();
      console.log(`📊 Rapport final de ${this.name}:`, stats);
      
      return stats;
    }
    
    getStats() {
      if (this.measurements.length === 0) {
        return { calls: 0, averageDuration: "0 ms" };
      }
      
      let totalDuration = 0;
      let maxDuration = 0;
      
      for (const data of this.measurements) {
        totalDuration += data.duration;
        maxDuration = Math.max(maxDuration, data.duration);
      }
      
      const averageDuration = totalDuration / this.measurements.length;
      
      return {
        calls: this.measurements.length,
        averageDuration: averageDuration.toFixed(2) + " ms",
        maxDuration: maxDuration.toFixed(2) + " ms",
        totalDuration: totalDuration.toFixed(2) + " ms"
      };
    }
  }
  
  export function monitorFunction(target, functionName, interval = 1000) {
    const originalFunction = target[functionName];
    const monitor = new performanceMonitor(functionName);
    
    target[functionName] = monitor.wrapFunction(originalFunction);
    monitor.start(interval);
    
    return function stopMonitoring() {
      target[functionName] = originalFunction;
      return monitor.stop();
    };
  }
  
  // Exemple d'usage
  // ---------------
  //
  // 1. Pour monitorer une fonction spécifique:
  //
  //    import { generateWordCloud } from './word-cloud';
  //    import { PerformanceMonitor } from './generic-performance-monitor';
  //
  //    // Créer une version monitorée de la fonction
  //    const monitoredWordCloud = PerformanceMonitor.forFunction(generateWordCloud, 'Nuage de mots');
  //
  //    // Démarrer le monitoring et appeler la fonction
  //    const monitor = new PerformanceMonitor('Nuage de mots');
  //    monitor.start(500); // Rapports toutes les 500ms
  //
  //    // Utiliser la fonction monitorée
  //    monitoredWordCloud(data);
  //
  //    // Plus tard, arrêter le monitoring
  //    monitor.stop();
  //
  // 2. Pour monitorer un ensemble de méthodes d'un objet:
  //
  //    import { wordCloudRenderer } from './word-cloud-renderer';
  //    import { PerformanceMonitor } from './generic-performance-monitor';
  //
  //    const monitor = new PerformanceMonitor('Rendu nuage');
  //    monitor.start();
  //
  //    // Instrumenter plusieurs méthodes
  //    const restore = monitor.instrumentMethods(wordCloudRenderer, [
  //      'layout', 'draw', 'updatePositions'
  //    ]);
  //
  //    // Utiliser l'objet normalement
  //    wordCloudRenderer.draw();
  //
  //    // Restaurer les méthodes originales quand le monitoring n'est plus nécessaire
  //    restore();
  //    monitor.stop();